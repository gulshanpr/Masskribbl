'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function WordChoices() {
  const { gameState, user } = useGameStore()

  if (!gameState || 
      gameState.status !== 'choosing' || 
      gameState.currentDrawer !== user?.id ||
      !gameState.wordChoices) {
    return null
  }

  const selectWord = (word: string) => {
    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('game:selectWord', word)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="glass border-primary/40 max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-black mb-2">
              Choose a word to draw
            </h2>
            <p className="text-black/60">
              Pick the word you want to draw for other players
            </p>
          </div>
          
          <div className="space-y-3">
            {gameState.wordChoices.map((word, index) => (
              <motion.div
                key={word}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => selectWord(word)}
                  variant="outline"
                  className="w-full h-12 text-lg font-medium bg-white/10 border-white/20 text-black hover:bg-black/20"
                >
                  {word}
                </Button>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-black/60">
              Choose wisely! You'll have 80 seconds to draw.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}