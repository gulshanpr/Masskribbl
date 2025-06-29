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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <Card className="glass border-primary/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-white/80 mb-4">
              Jump into a game with random players instantly!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                4-8 players
              </div>
              <div>•</div>
              <div>3 rounds</div>
              <div>•</div>
              <div>80s per turn</div>
            </div>
          </div>

          <Button
            onClick={quickPlay}
            disabled={isSearching}
            className="w-full h-12 text-lg font-medium animate-rainbow"
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finding Players...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Play Now!
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-white/50">
              Average wait time: 10-30 seconds
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}