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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass border-primary/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Join Private Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Room Code
            </label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter 6-digit code"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-center text-lg font-mono"
              maxLength={6}
            />
          </div>

          <Button
            onClick={joinRoom}
            disabled={isJoining || !roomCode.trim()}
            className="w-full h-12 text-lg font-medium"
          >
            {isJoining ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining Room...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Room
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-white/60">
              Ask your friend for the room code to join their game
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}