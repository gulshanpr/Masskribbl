'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import DrawingCanvas from '@/components/game/DrawingCanvas'
import DrawingTools from '@/components/game/DrawingTools'
import GameChat from '@/components/game/GameChat'
import PlayerList from '@/components/game/PlayerList'
import GameTimer from '@/components/game/GameTimer'
import WordChoices from '@/components/game/WordChoices'
import WordHint from '@/components/game/WordHint'
import GameEndHandler from '@/components/game/GameEndHandler'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Share2, Home } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function GameRoom() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.roomCode as string
  const [isConnecting, setIsConnecting] = useState(true)
  
  const {
    user,
    gameState,
    setGameState,
    isConnected,
    setIsConnected,
    clearStrokes,
    clearMessages
  } = useGameStore()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    const socket = socketManager.connect()
    
    socket.on('connect', () => {
      setIsConnected(true)
      setIsConnecting(false)
      
      // Join the room
      socket.emit('room:join', {
        roomCode,
        player: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('game:state', (state) => {
      setGameState(state)
    })

    socket.on('game:roundStart', () => {
      clearStrokes()
      toast.success('New round started!')
    })

    socket.on('game:roundEnd', (results) => {
      toast.success(`Round ended! Winner: ${results.winner}`)
    })

    socket.on('game:end', (results) => {
      toast.success(`Game finished! Winner: ${results.winner}`)
    })

    socket.on('error', (error) => {
      toast.error(error)
      if (error.includes('not found')) {
        router.push('/')
      }
    })

    return () => {
      socketManager.disconnect()
      clearStrokes()
      clearMessages()
      setGameState(null)
    }
  }, [user, roomCode, router, setIsConnected, setGameState, clearStrokes, clearMessages])

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    toast.success('Room code copied!')
  }

  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my MassKribbl game!',
        text: `Join my drawing game with code: ${roomCode}`,
        url: window.location.href
      })
    } else {
      copyRoomCode()
    }
  }

  const startGame = () => {
    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('game:start')
    }
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Connecting to game...</p>
        </motion.div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass border-destructive/40">
          <CardContent className="p-6 text-center">
            <p className="text-white mb-4">Failed to join game room</p>
            <Button onClick={() => router.push('/')} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isHost = gameState.hostId === user?.id
  const canStartGame = isHost && gameState.status === 'waiting' && gameState.players.length >= 2

  // Add debugging
  console.log('Game state debug:', {
    user: user?.id,
    firstPlayer: gameState.players[0]?.id,
    isHost,
    status: gameState.status,
    playerCount: gameState.players.length,
    canStartGame,
    players: gameState.players.map(p => ({ id: p.id, username: p.username }))
  })

  return (
    <div className="min-h-screen p-4">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="sm"
            >
              <Home className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Room {roomCode}</h1>
              <p className="text-white/60 text-sm">
                {gameState.status === 'waiting' ? 'Waiting for players...' :
                 gameState.status === 'choosing' ? 'Choosing word...' :
                 gameState.status === 'drawing' ? 'Drawing in progress' :
                 gameState.status === 'finished' ? 'Game finished' :
                 'Game in progress'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={copyRoomCode} variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={shareRoom} variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            {canStartGame && (
              <Button onClick={startGame} className="animate-glow">
                Start Game
              </Button>
            )}
            {!canStartGame && isHost && gameState.status === 'waiting' && (
              <div className="text-sm text-white/60">
                Need {2 - gameState.players.length} more player{2 - gameState.players.length !== 1 ? 's' : ''} to start
              </div>
            )}
          </div>
        </motion.div>

        {/* Game Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools & Timer */}
          <div className="lg:col-span-1 space-y-4">
            <GameTimer />
            <DrawingTools />
            <WordHint />
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="aspect-[4/3] bg-white rounded-lg shadow-2xl"
            >
              <DrawingCanvas />
            </motion.div>
          </div>

          {/* Right Sidebar - Players & Chat */}
          <div className="lg:col-span-1 space-y-4">
            <PlayerList />
            <div className="hidden md:block">
              <GameChat />
            </div>
          </div>
        </div>

        {/* Mobile Chat */}
        <div className="md:hidden">
          <GameChat />
        </div>
      </div>

      {/* Word Selection Modal */}
      <WordChoices />
      
      {/* Game End Handler */}
      <GameEndHandler />
    </div>
  )
}