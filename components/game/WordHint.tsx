'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

export default function WordHint() {
  const { gameState, user } = useGameStore()

  if (!gameState || 
      gameState.status !== 'drawing' || 
      !gameState.currentWord ||
      gameState.currentDrawer === user?.id) {
    return null
  }

  // Create hint with underscores
  const wordHint = gameState.currentWord.replace(/[a-zA-Z]/g, '_')
  const wordLength = gameState.currentWord.length

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass rounded-lg p-4 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Eye className="w-5 h-5 text-blue-400" />
        <span className="text-white font-medium">Word Hint</span>
      </div>
      
      <div className="space-y-3">
        <div className="text-2xl font-mono font-bold text-white tracking-wider">
          {wordHint.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="inline-block mx-1"
            >
              {char}
            </motion.span>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {wordLength} letters
          </Badge>
          <Badge variant="outline" className="text-sm">
            Category: General
          </Badge>
        </div>
        
        <p className="text-sm text-white/60">
          Guess the word by typing in the chat!
        </p>
      </div>
    </motion.div>
  )
}