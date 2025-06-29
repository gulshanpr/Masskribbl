'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useGameStore } from '@/lib/store'
import { socketManager, DrawingStroke } from '@/lib/socket'
import { motion } from 'framer-motion'

interface Point {
  x: number
  y: number
}

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  
  const {
    strokes,
    addStroke,
    clearStrokes,
    currentTool,
    brushSize,
    brushColor,
    gameState
  } = useGameStore()

  const isCurrentDrawer = gameState?.currentDrawer === useGameStore.getState().user?.id
  const canDraw = isCurrentDrawer && gameState?.status === 'drawing'

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      // Set drawing properties
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.imageSmoothingEnabled = true
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over'

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
    })
  }, [strokes, currentTool])

  // Socket listeners
  useEffect(() => {
    const socket = socketManager.getSocket()
    if (!socket) return

    const handleDrawingStroke = (stroke: DrawingStroke) => {
      addStroke(stroke)
    }

    const handleClearCanvas = () => {
      clearStrokes()
    }

    socket.on('drawing:stroke', handleDrawingStroke)
    socket.on('drawing:clear', handleClearCanvas)

    return () => {
      socket.off('drawing:stroke', handleDrawingStroke)
      socket.off('drawing:clear', handleClearCanvas)
    }
  }, [addStroke, clearStrokes])

  const getPointFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }, [])

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canDraw) return

    e.preventDefault()
    setIsDrawing(true)
    const point = getPointFromEvent(e)
    setCurrentStroke([point])
  }, [canDraw, getPointFromEvent])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canDraw) return

    e.preventDefault()
    const point = getPointFromEvent(e)
    setCurrentStroke(prev => [...prev, point])
  }, [isDrawing, canDraw, getPointFromEvent])

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !canDraw) return

    setIsDrawing(false)
    
    if (currentStroke.length > 1) {
      const stroke: DrawingStroke = {
        id: Date.now().toString(),
        points: currentStroke,
        color: currentTool === 'eraser' ? '#000000' : brushColor,
        size: brushSize,
        timestamp: Date.now()
      }

      // Add to local state
      addStroke(stroke)

      // Send to server
      const socket = socketManager.getSocket()
      if (socket) {
        socket.emit('drawing:stroke', stroke)
      }
    }

    setCurrentStroke([])
  }, [isDrawing, canDraw, currentStroke, currentTool, brushColor, brushSize, addStroke])

  const clearCanvas = useCallback(() => {
    if (!canDraw) return

    clearStrokes()
    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('drawing:clear')
    }
  }, [canDraw, clearStrokes])

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        className={`
          w-full h-full rounded-lg border-2 bg-white
          ${canDraw ? 'drawing-canvas cursor-crosshair' : 'cursor-not-allowed'}
          ${canDraw ? 'neon-border' : 'border-border'}
        `}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {!canDraw && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="glass rounded-lg p-4">
            <p className="text-white font-medium">
              {gameState?.status === 'waiting' ? 'Waiting for game to start...' : 
               gameState?.status === 'choosing' ? 'Drawer is choosing a word...' :
               'Watch the drawer create their masterpiece!'}
            </p>
          </div>
        </div>
      )}

      {canDraw && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={clearCanvas}
          className="absolute top-4 right-4 glass rounded-full p-3 text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  )
}