'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Users } from 'lucide-react'

export default function QuickPlay() {
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { user } = useGameStore()

  const quickPlay = async () => {
    if (!user) return

    setIsSearching(true)
    
    try {
      const socket = socketManager.connect()
      
      socket.emit('matchmaking:join', {
        player: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      })

      socket.on('matchmaking:found', (roomCode: string) => {
        router.push(`/game/${roomCode}`)
      })

      socket.on('error', (error: string) => {
        console.error('Matchmaking failed:', error)
        setIsSearching(false)
      })
    } catch (error) {
      console.error('Quick play failed:', error)
      setIsSearching(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
    >
      <div className="character-card h-full">
        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-4 rounded-t-2xl relative overflow-hidden">
          {/* Floating decorations */}
          <motion.div
            className="absolute top-2 right-2 text-2xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡
          </motion.div>
          <motion.div
            className="absolute bottom-1 left-2 text-xl"
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎯
          </motion.div>

          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🚀</div>
            <h3 className="text-xl font-black text-white" style={{ textShadow: '2px 2px 0px #2D3748' }}>
              Quick Play
            </h3>
          </div>
        </div>

        <div className="p-6 bg-white rounded-b-2xl">
          <div className="text-center mb-6">
            <motion.div
              className="text-4xl mb-4"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎮
            </motion.div>
            <p className="text-gray-700 font-semibold mb-4">
              Jump into a game with random players instantly! 🌟
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-1">
                <span className="text-lg">👥</span>
                <span>4-8 players</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <span className="text-lg">🎯</span>
                <span>3 rounds</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1">
                <span className="text-lg">⏱️</span>
                <span>80s per turn</span>
              </div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={quickPlay}
              disabled={isSearching}
              className="fun-button w-full h-12 text-lg font-black disabled:opacity-50"
              style={{
                background: isSearching 
                  ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(145deg, #10B981 0%, #059669 100%)'
              }}
            >
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-xl"
                  >
                    🔍
                  </motion.div>
                  <span>Finding Players...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">⚡</span>
                  <span>PLAY NOW!</span>
                  <span className="text-xl">🎉</span>
                </div>
              )}
            </button>
          </motion.div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500 font-medium">
              ⏱️ Average wait time: 10-30 seconds
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}