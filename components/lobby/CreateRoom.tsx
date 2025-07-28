'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Settings, Play } from 'lucide-react'

export default function CreateRoom() {
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [maxRounds, setMaxRounds] = useState(3)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { user } = useGameStore()

  const createRoom = async () => {
    if (!user) {
      console.log('No user found')
      return
    }

    console.log('Creating room with user:', user.id)
    setIsCreating(true)
    
    try {
      const socket = socketManager.connect()
      console.log('Socket connected:', socket.connected)
      
      // Set up event listeners first
      const roomCreatedHandler = (roomCode: string) => {
        console.log('Room created successfully:', roomCode)
        setIsCreating(false)
        router.push(`/game/${roomCode}`)
      }

      const errorHandler = (error: string) => {
        console.error('Failed to create room:', error)
        setIsCreating(false)
      }

      socket.on('room:created', roomCreatedHandler)
      socket.on('error', errorHandler)
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.error('Room creation timeout')
        socket.off('room:created', roomCreatedHandler)
        socket.off('error', errorHandler)
        setIsCreating(false)
      }, 15000) // 15 second timeout
      
      socket.emit('room:create', {
        hostId: user.id,
        maxPlayers,
        maxRounds
      })
      console.log('Room create event emitted')

      // Clear timeout when room is created
      socket.once('room:created', () => {
        clearTimeout(timeout)
        socket.off('room:created', roomCreatedHandler)
        socket.off('error', errorHandler)
      })

      socket.once('error', () => {
        clearTimeout(timeout)
        socket.off('room:created', roomCreatedHandler)
        socket.off('error', errorHandler)
      })
    } catch (error) {
      console.error('Failed to create room:', error)
      setIsCreating(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileHover={{ scale: 1.05, rotate: -1 }}
    >
      <div className="character-card h-full">
        <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 rounded-t-2xl relative overflow-hidden">
          {/* Floating decorations */}
          <motion.div
            className="absolute top-2 right-2 text-2xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏠
          </motion.div>
          <motion.div
            className="absolute bottom-1 left-2 text-xl"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚙️
          </motion.div>

          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">🏗️</div>
            <h3 className="text-xl font-black text-white" style={{ textShadow: '2px 2px 0px #2D3748' }}>
              Create Room
            </h3>
          </div>
        </div>

        <div className="p-6 bg-white rounded-b-2xl">
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🎪</div>
              <p className="text-gray-700 font-semibold text-sm">
                Set up your own private game room! 🎨
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                👥 Max Players
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 12].map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => setMaxPlayers(count)}
                    className={`
                      h-10 rounded-lg font-bold text-sm border-3 transition-all
                      ${maxPlayers === count
                        ? 'bg-red-500 text-white border-gray-800 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {count}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🎯 Rounds
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 5].map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => setMaxRounds(count)}
                    className={`
                      h-10 rounded-lg font-bold text-sm border-3 transition-all
                      ${maxRounds === count
                        ? 'bg-blue-500 text-white border-gray-800 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {count}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="mt-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={createRoom}
              disabled={isCreating}
              className="fun-button w-full h-12 text-lg font-black disabled:opacity-50"
              style={{
                background: isCreating 
                  ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(145deg, #3B82F6 0%, #1D4ED8 100%)'
              }}
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-xl"
                  >
                    🔧
                  </motion.div>
                  <span>Creating Room...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🏗️</span>
                  <span>CREATE ROOM</span>
                  <span className="text-xl">🎪</span>
                </div>
              )}
            </button>
          </motion.div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500 font-medium">
              🔗 Share the room code with friends to play together
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}