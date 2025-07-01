'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { Trash2, Palette, Sun, Moon } from 'lucide-react'

interface Point {
  x: number
  y: number
}

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
  const [shapeStart, setShapeStart] = useState<Point | null>(null)
  const [canvasBackground, setCanvasBackground] = useState<'white' | 'black'>('white')
  
  const {
    strokes,
    addStroke,
    clearStrokes,
    currentTool,
    brushSize,
    brushColor,
    gameState,
    user
  } = useGameStore()

  // Responsive canvas size
  const [canvasDims, setCanvasDims] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setCanvasDims({ width: rect.width, height: rect.height })
      }
    }
    updateDims()
    window.addEventListener('resize', updateDims)
    return () => window.removeEventListener('resize', updateDims)
  }, [])

  const getCanvasContext = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    return { canvas, ctx }
  }

  const getPreviewContext = () => {
    const canvas = previewRef.current
    if (!canvas) return null
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    return { canvas, ctx }
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }

  const drawLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, size: number) => {
    console.log('drawLine', { from, to, color, size })
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }

  const drawRectangle = (ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, size: number) => {
    console.log('drawRectangle', { from, to, color, size })
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.beginPath()
    ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y)
    ctx.stroke()
  }

  const drawSquare = (ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, size: number) => {
    const side = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))
    const end = {
      x: from.x + Math.sign(to.x - from.x) * side,
      y: from.y + Math.sign(to.y - from.y) * side
    }
    console.log('drawSquare', { from, to: end, color, size })
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.beginPath()
    ctx.rect(from.x, from.y, end.x - from.x, end.y - from.y)
    ctx.stroke()
  }

  const drawCircle = (ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, size: number) => {
    const radius = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2))
    console.log('drawCircle', { from, to, color, size, radius })
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.beginPath()
    ctx.arc(from.x, from.y, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState?.currentDrawer !== user?.id) return
    const pos = getMousePos(e)
    setIsDrawing(true)
    setLastPoint(pos)
    setShapeStart(pos)
    console.log('handleMouseDown', { tool: currentTool, pos })
    if (currentTool === 'brush' || currentTool === 'eraser') {
      const context = getCanvasContext()
      if (context) {
        drawLine(
          context.ctx,
          pos,
          pos,
          currentTool === 'eraser' ? canvasBackground : brushColor,
          brushSize
        )
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || gameState?.currentDrawer !== user?.id) return
    const pos = getMousePos(e)
    if (!lastPoint || !shapeStart) return
    console.log('handleMouseMove', { tool: currentTool, lastPoint, pos })
    if (currentTool === 'brush' || currentTool === 'eraser') {
      const context = getCanvasContext()
      if (context) {
        drawLine(
          context.ctx,
          lastPoint,
          pos,
          currentTool === 'eraser' ? canvasBackground : brushColor,
          brushSize
        )
      }
      const stroke = {
        id: Date.now().toString(),
        points: [lastPoint, pos],
        color: currentTool === 'eraser' ? canvasBackground : brushColor,
        size: brushSize,
        tool: currentTool,
        timestamp: Date.now()
      }
      addStroke(stroke)
      const socket = socketManager.getSocket()
      if (socket) socket.emit('drawing:stroke', stroke)
      setLastPoint(pos)
    } else {
      // For shapes, show preview
      const preview = getPreviewContext()
      if (preview) {
        preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height)
        const color = brushColor
        switch (currentTool) {
          case 'rectangle':
            drawRectangle(preview.ctx, shapeStart, pos, color, brushSize)
            break
          case 'square':
            drawSquare(preview.ctx, shapeStart, pos, color, brushSize)
            break
          case 'circle':
            drawCircle(preview.ctx, shapeStart, pos, color, brushSize)
            break
          case 'line':
            drawLine(preview.ctx, shapeStart, pos, color, brushSize)
            break
        }
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('handleMouseUp', { tool: currentTool })
    if (!isDrawing || !shapeStart) {
      setIsDrawing(false)
      setLastPoint(null)
      setShapeStart(null)
      return
    }
    const pos = getMousePos(e)
    const color = currentTool === 'eraser' ? canvasBackground : brushColor
    const context = getCanvasContext()
    if (context) {
      switch (currentTool) {
        case 'rectangle':
          drawRectangle(context.ctx, shapeStart, pos, color, brushSize)
          break
        case 'square':
          drawSquare(context.ctx, shapeStart, pos, color, brushSize)
          break
        case 'circle':
          drawCircle(context.ctx, shapeStart, pos, color, brushSize)
          break
        case 'line':
          drawLine(context.ctx, shapeStart, pos, color, brushSize)
          break
      }
    }
    if (['rectangle', 'square', 'circle', 'line'].includes(currentTool)) {
      addStroke({
        id: Date.now().toString(),
        points: [shapeStart, pos],
        color,
        size: brushSize,
        tool: currentTool,
        timestamp: Date.now()
      })
      const socket = socketManager.getSocket()
      if (socket) {
        socket.emit('drawing:stroke', {
          id: Date.now().toString(),
          points: [shapeStart, pos],
          color,
          size: brushSize,
          tool: currentTool,
          timestamp: Date.now()
        })
      }
    }
    const preview = getPreviewContext()
    if (preview) preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height)
    setIsDrawing(false)
    setLastPoint(null)
    setShapeStart(null)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (gameState?.currentDrawer !== user?.id) return
    
    setIsDrawing(true)
    const pos = getTouchPos(e)
    setLastPoint(pos)
    setShapeStart(pos)
    if (currentTool === 'brush' || currentTool === 'eraser') {
      const context = getCanvasContext()
      if (context) {
        drawLine(
          context.ctx,
          pos,
          pos,
          currentTool === 'eraser' ? canvasBackground : brushColor,
          brushSize
        )
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || gameState?.currentDrawer !== user?.id) return
    
    const pos = getTouchPos(e)
    if (!lastPoint || !shapeStart) return
    if (currentTool === 'brush' || currentTool === 'eraser') {
      const context = getCanvasContext()
      if (context) {
        drawLine(
          context.ctx,
          lastPoint,
          pos,
          currentTool === 'eraser' ? canvasBackground : brushColor,
          brushSize
        )
      }
      const stroke = {
        id: Date.now().toString(),
        points: [lastPoint, pos],
        color: currentTool === 'eraser' ? canvasBackground : brushColor,
        size: brushSize,
        tool: currentTool,
        timestamp: Date.now()
      }
      addStroke(stroke)
      const socket = socketManager.getSocket()
      if (socket) socket.emit('drawing:stroke', stroke)
      setLastPoint(pos)
    } else {
      const preview = getPreviewContext()
      if (preview) {
        preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height)
        const color = brushColor
        switch (currentTool) {
          case 'rectangle':
            console.log('Drawing rectangle')
            drawRectangle(preview.ctx, shapeStart, pos, color, brushSize)
            break
          case 'square':
            console.log('Drawing square')
            drawSquare(preview.ctx, shapeStart, pos, color, brushSize)
            break
          case 'circle':
            console.log('Drawing circle')
            drawCircle(preview.ctx, shapeStart, pos, color, brushSize)
            break
          case 'line':
            console.log('Drawing line')
            drawLine(preview.ctx, shapeStart, pos, color, brushSize)
            break
        }
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || !shapeStart) {
      setIsDrawing(false)
      setLastPoint(null)
      setShapeStart(null)
      return
    }
    const pos = lastPoint
    const color = currentTool === 'eraser' ? canvasBackground : brushColor
    const context = getCanvasContext()
    if (context && pos) {
      switch (currentTool) {
        case 'rectangle':
          console.log('Drawing rectangle')
          drawRectangle(context.ctx, shapeStart, pos, color, brushSize)
          break
        case 'square':
          console.log('Drawing square')
          drawSquare(context.ctx, shapeStart, pos, color, brushSize)
          break
        case 'circle':
          console.log('Drawing circle')
          drawCircle(context.ctx, shapeStart, pos, color, brushSize)
          break
        case 'line':
          console.log('Drawing line')
          drawLine(context.ctx, shapeStart, pos, color, brushSize)
          break
      }
    }
    if (['rectangle', 'square', 'circle', 'line'].includes(currentTool) && pos) {
      addStroke({
        id: Date.now().toString(),
        points: [shapeStart, pos],
        color,
        size: brushSize,
        tool: currentTool,
        timestamp: Date.now()
      })
      const socket = socketManager.getSocket()
      if (socket) {
        socket.emit('drawing:stroke', {
          id: Date.now().toString(),
          points: [shapeStart, pos],
          color,
          size: brushSize,
          tool: currentTool,
          timestamp: Date.now()
        })
      }
    }
    const preview = getPreviewContext()
    if (preview) preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height)
    setIsDrawing(false)
    setLastPoint(null)
    setShapeStart(null)
  }

  const handleClearCanvas = () => {
    const context = getCanvasContext()
    if (!context) return
    
    const { canvas, ctx } = context
    ctx.fillStyle = canvasBackground
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    clearStrokes()
    
    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('drawing:clear')
    }
  }

  const toggleCanvasBackground = () => {
    const newBackground = canvasBackground === 'white' ? 'black' : 'white'
    setCanvasBackground(newBackground)
    
    // Clear and redraw with new background
    const context = getCanvasContext()
    if (!context) return
    
    const { canvas, ctx } = context
    ctx.fillStyle = newBackground
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Redraw all strokes
    strokes.forEach(stroke => {
      ctx.strokeStyle = stroke.tool === 'eraser' ? newBackground : stroke.color
      ctx.lineWidth = stroke.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      ctx.lineTo(stroke.points[1].x, stroke.points[1].y)
      ctx.stroke()
    })
  }

  // Handle incoming strokes from other players
  useEffect(() => {
    const socket = socketManager.getSocket()
    if (!socket) return

    const handleIncomingStroke = (stroke: any) => {
      if (stroke.playerId !== user?.id) {
        const context = getCanvasContext()
        if (!context) return
        const ctx = context.ctx
        const color = stroke.tool === 'eraser' ? canvasBackground : stroke.color
        console.log('handleIncomingStroke', { tool: stroke.tool, from: stroke.points[0], to: stroke.points[1], color, size: stroke.size })
        switch (stroke.tool) {
          case 'brush':
          case 'eraser':
          case 'line':
            drawLine(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
            break
          case 'rectangle':
            drawRectangle(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
            break
          case 'square':
            drawSquare(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
            break
          case 'circle':
            drawCircle(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
            break
        }
      }
    }

    const handleClearCanvas = () => {
      const context = getCanvasContext()
      if (!context) return
      const { canvas, ctx } = context
      ctx.fillStyle = canvasBackground
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    socket.on('drawing:stroke', handleIncomingStroke)
    socket.on('drawing:clear', handleClearCanvas)

    return () => {
      socket.off('drawing:stroke', handleIncomingStroke)
      socket.off('drawing:clear', handleClearCanvas)
    }
  }, [user?.id, canvasBackground])

  // Set canvas size and preview size
  useEffect(() => {
    const context = getCanvasContext()
    const preview = getPreviewContext()
    if (!context || !preview) return
    context.canvas.width = canvasDims.width
    context.canvas.height = canvasDims.height
    preview.canvas.width = canvasDims.width
    preview.canvas.height = canvasDims.height
    // Set initial background
    const ctx = context.canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = canvasBackground
      ctx.fillRect(0, 0, context.canvas.width, context.canvas.height)
    }
    preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height)
  }, [canvasBackground, canvasDims])

  // Redraw strokes when they change
  useEffect(() => {
    const context = getCanvasContext()
    if (!context) return
    const { canvas, ctx } = context
    ctx.fillStyle = canvasBackground
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    strokes.forEach(stroke => {
      const color = stroke.tool === 'eraser' ? canvasBackground : stroke.color
      switch (stroke.tool) {
        case 'brush':
        case 'eraser':
        case 'line':
          drawLine(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
          break
        case 'rectangle':
          drawRectangle(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
          break
        case 'square':
          drawSquare(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
          break
        case 'circle':
          drawCircle(ctx, stroke.points[0], stroke.points[1], color, stroke.size)
          break
      }
    })
  }, [strokes, canvasBackground, canvasDims])

  const isCurrentDrawer = gameState?.currentDrawer === user?.id

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] min-w-[400px]">
      {/* Static Multicolor Border */}
      <div className="absolute inset-0 rounded-lg p-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500">
        <div className={`w-full h-full rounded-lg overflow-hidden ${canvasBackground === 'white' ? 'bg-white' : 'bg-black'}`} style={{position: 'relative'}}>
          <canvas
            ref={canvasRef}
            width={canvasDims.width}
            height={canvasDims.height}
            className="w-full h-full cursor-crosshair absolute top-0 left-0"
            style={{
              cursor: 'crosshair',
              touchAction: 'none',
              zIndex: 1
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          {/* Preview canvas for shape preview */}
          <canvas
            ref={previewRef}
            width={canvasDims.width}
            height={canvasDims.height}
            className="w-full h-full absolute top-0 left-0 pointer-events-none"
            style={{ zIndex: 2 }}
          />
        </div>
      </div>

      {/* Canvas Controls */}
      {isCurrentDrawer && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 z-10 flex gap-2"
        >
          {/* Background Toggle Button */}
          <Button
            onClick={toggleCanvasBackground}
            variant="outline"
            size="sm"
            className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/90 backdrop-blur-sm"
          >
            {canvasBackground === 'white' ? (
              <Moon className="w-5 h-5 text-gray-700" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
          </Button>

          {/* Delete Button */}
          <Button
            onClick={handleClearCanvas}
            variant="destructive"
            size="sm"
            className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* Drawing Indicator */}
      {isCurrentDrawer && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 left-4 z-10"
        >
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            You're Drawing!
          </div>
        </motion.div>
      )}

      {/* Background Indicator */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
          canvasBackground === 'white' 
            ? 'bg-white text-gray-700' 
            : 'bg-black text-white'
        }`}>
          {canvasBackground === 'white' ? 'White Canvas' : 'Black Canvas'}
        </div>
      </div>
    </div>
  )
}
