'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Brush, Eraser, Palette, Square, Circle, Minus, MoreHorizontal } from 'lucide-react'

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

  const tools = [
    { id: 'brush', icon: Brush, label: 'Brush' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'square', icon: Square, label: 'Square' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'dotted', icon: MoreHorizontal, label: 'Dotted Line' }
  ]

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass rounded-lg p-4 space-y-4"
    >
      {/* Tool Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(tool.id as any)}
              className="flex items-center gap-1 text-xs h-8"
              title={tool.label}
            >
              <tool.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{tool.label}</span>
            </Button>
          ))}
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
      {currentTool !== 'eraser' && (
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
                  ${brushColor === color ? 'border-white scale-110 ring-2 ring-primary' : 'border-gray-400'}
                  ${color === '#ffffff' ? 'border-gray-600' : ''}
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
            className="rounded-full border border-white/40 flex-shrink-0"
            style={{
              backgroundColor: currentTool === 'eraser' ? '#ff6b6b' : brushColor,
              width: `${Math.max(brushSize / 2, 8)}px`,
              height: `${Math.max(brushSize / 2, 8)}px`
            }}
          />
          <div className="flex flex-col">
            <span className="font-medium">
              {tools.find(t => t.id === currentTool)?.label || 'Brush'}
            </span>
            <span className="text-xs text-white/60">
              {brushSize}px
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}