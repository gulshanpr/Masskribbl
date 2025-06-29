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
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
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

  const getCanvasContext = () => {
    const canvas = canvasRef.current
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

  const drawLine = (from: Point, to: Point) => {
    const context = getCanvasContext()
    if (!context) return
    
    const { ctx } = context
    
    ctx.strokeStyle = currentTool === 'eraser' ? canvasBackground : brushColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState?.currentDrawer !== user?.id) return
    
    setIsDrawing(true)
    const pos = getMousePos(e)
    setLastPoint(pos)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || gameState?.currentDrawer !== user?.id) return
    
    const pos = getMousePos(e)
    if (lastPoint) {
      drawLine(lastPoint, pos)
      
      const stroke = {
        id: Date.now().toString(),
        from: lastPoint,
        to: pos,
        color: currentTool === 'eraser' ? canvasBackground : brushColor,
        size: brushSize,
        tool: currentTool
      }
      
      addStroke(stroke)
      
      const socket = socketManager.getSocket()
      if (socket) {
        socket.emit('drawing:stroke', stroke)
      }
    }
    setLastPoint(pos)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setLastPoint(null)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (gameState?.currentDrawer !== user?.id) return
    
    setIsDrawing(true)
    const pos = getTouchPos(e)
    setLastPoint(pos)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || gameState?.currentDrawer !== user?.id) return
    
    const pos = getTouchPos(e)
    if (lastPoint) {
      drawLine(lastPoint, pos)
      
      const stroke = {
        id: Date.now().toString(),
        from: lastPoint,
        to: pos,
        color: currentTool === 'eraser' ? canvasBackground : brushColor,
        size: brushSize,
        tool: currentTool
      }
      
      addStroke(stroke)
      
      const socket = socketManager.getSocket()
      if (socket) {
        socket.emit('drawing:stroke', stroke)
      }
    }
    setLastPoint(pos)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)
    setLastPoint(null)
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
      ctx.moveTo(stroke.from.x, stroke.from.y)
      ctx.lineTo(stroke.to.x, stroke.to.y)
      ctx.stroke()
    })
  }

  // Handle incoming strokes from other players
  useEffect(() => {
    const socket = socketManager.getSocket()
    if (!socket) return

    const handleIncomingStroke = (stroke: any) => {
      if (stroke.playerId !== user?.id) {
        drawLine(stroke.from, stroke.to)
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

  // Set canvas size
  useEffect(() => {
    const context = getCanvasContext()
    if (!context) return
    
    const { canvas } = context
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width
    canvas.height = rect.height
    
    // Set initial background
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = canvasBackground
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [canvasBackground])

  // Redraw strokes when they change
  useEffect(() => {
    const context = getCanvasContext()
    if (!context) return
    
    const { canvas, ctx } = context
    
    // Clear and redraw
    ctx.fillStyle = canvasBackground
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    strokes.forEach(stroke => {
      ctx.strokeStyle = stroke.tool === 'eraser' ? canvasBackground : stroke.color
      ctx.lineWidth = stroke.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(stroke.from.x, stroke.from.y)
      ctx.lineTo(stroke.to.x, stroke.to.y)
      ctx.stroke()
    })
  }, [strokes, canvasBackground])

  const isCurrentDrawer = gameState?.currentDrawer === user?.id

  return (
    <div className="relative w-full h-full">
      {/* Static Multicolor Border */}
      <div className="absolute inset-0 rounded-lg p-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500">
        <div className={`w-full h-full rounded-lg overflow-hidden ${canvasBackground === 'white' ? 'bg-white' : 'bg-black'}`}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            style={{
              cursor: 'crosshair',
              touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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