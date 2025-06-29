'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Brush, Eraser, Palette } from 'lucide-react'

const COLORS = [
  '#000000', '#ffffff', '#ff0080', '#ff8c00', '#40e0d0', '#32cd32',
  '#ff69b4', '#9370db', '#ffd700', '#ff4500', '#00ced1', '#7fff00',
  '#dc143c', '#4169e1', '#ff1493', '#00ff7f', '#ff6347', '#1e90ff'
]

const BRUSH_SIZES = [2, 5, 10, 15, 20, 25]

export default function DrawingTools() {
  const {
    currentTool,
    setCurrentTool,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    gameState,
    user
  } = useGameStore()

  const isCurrentDrawer = gameState?.currentDrawer === user?.id
  const canDraw = isCurrentDrawer && gameState?.status === 'drawing'

  if (!canDraw) return null

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass rounded-lg p-4 space-y-4"
    >
      {/* Tool Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white">Tools</h3>
        <div className="flex gap-2">
          <Button
            variant={currentTool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('brush')}
            className="flex-1"
          >
            <Brush className="w-4 h-4" />
          </Button>
          <Button
            variant={currentTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('eraser')}
            className="flex-1"
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Brush Size */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white">Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {BRUSH_SIZES.map((size) => (
            <Button
              key={size}
              variant={brushSize === size ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBrushSize(size)}
              className="h-8 text-xs"
            >
              {size}px
            </Button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      {currentTool === 'brush' && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setBrushColor(color)}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all
                  ${brushColor === color ? 'border-white scale-110' : 'border-gray-400'}
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Current Selection Preview */}
      <div className="pt-2 border-t border-white/20">
        <div className="flex items-center gap-2 text-sm text-white">
          <div
            className="w-6 h-6 rounded-full border border-white/40"
            style={{
              backgroundColor: currentTool === 'brush' ? brushColor : '#666',
              width: `${Math.max(brushSize / 2, 6)}px`,
              height: `${Math.max(brushSize / 2, 6)}px`
            }}
          />
          <span>
            {currentTool === 'brush' ? 'Brush' : 'Eraser'} • {brushSize}px
          </span>
        </div>
      </div>
    </motion.div>
  )
}