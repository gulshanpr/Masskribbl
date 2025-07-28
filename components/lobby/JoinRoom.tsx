'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Hash } from 'lucide-react'

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()
  const { user } = useGameStore()

  const joinRoom = async () => {
    if (!user || !roomCode.trim()) return

    setIsJoining(true)
    
    try {
      const socket = socketManager.connect()
      
      socket.emit('room:join', {
        roomCode: roomCode.toUpperCase(),
        player: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      })

      socket.on('room:joined', () => {
        router.push(`/game/${roomCode.toUpperCase()}`)
      })

      socket.on('error', (error: string) => {
        console.error('Failed to join room:', error)
        setIsJoining(false)
      })
    } catch (error) {
      console.error('Failed to join room:', error)
      setIsJoining(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinRoom()
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ scale: 1.05, rotate: 1 }}
    >
      <div className="character-card h-full">
        <div className="bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 p-4 rounded-t-2xl relative overflow-hidden">
          {/* Floating decorations */}
          <motion.div
            className="absolute top-2 right-2 text-2xl"
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚪
          </motion.div>
          <motion.div
            className="absolute bottom-1 left-2 text-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🔑
          </motion.div>

          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🎫</div>
            <h3 className="text-xl font-black text-white" style={{ textShadow: '2px 2px 0px #2D3748' }}>
              Join Room
            </h3>
          </div>
        </div>

        <div className="p-6 bg-white rounded-b-2xl">
          <div className="text-center mb-6">
            <motion.div
              className="text-4xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎪
            </motion.div>
            <p className="text-gray-700 font-semibold mb-4">
              Join your friend's game room! 🎉
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🔢 Room Code
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter 6-digit code"
                className="fun-input w-full pl-12 text-center text-lg font-bold tracking-wider"
                maxLength={6}
              />
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={joinRoom}
              disabled={isJoining || !roomCode.trim()}
              className="fun-button w-full h-12 text-lg font-black disabled:opacity-50"
              style={{
                background: (isJoining || !roomCode.trim())
                  ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(145deg, #10B981 0%, #059669 100%)'
              }}
            >
              {isJoining ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-xl"
                  >
                    🔍
                  </motion.div>
                  <span>Joining Room...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🚪</span>
                  <span>JOIN ROOM</span>
                  <span className="text-xl">🎉</span>
                </div>
              )}
            </button>
          </motion.div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500 font-medium">
              💬 Ask your friend for the room code to join their game
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}