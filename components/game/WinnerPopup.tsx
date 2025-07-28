'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Crown, Star, Sparkles, Medal, Award, Home, RotateCcw } from 'lucide-react'
// @ts-ignore
import confetti from 'canvas-confetti'

interface WinnerPopupProps {
  isOpen: boolean
  onClose: () => void
  winner: {
    id: string
    username: string
    avatar: string
    score: number
  }
  allPlayers: Array<{
    id: string
    username: string
    avatar: string
    score: number
  }>
  isCurrentUser: boolean
}

export default function WinnerPopup({ isOpen, onClose, winner, allPlayers, isCurrentUser }: WinnerPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()
  const { clearStrokes, clearMessages, setGameState } = useGameStore()

  useEffect(() => {
    if (isOpen && isCurrentUser) {
      setShowConfetti(true)
      
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen, isCurrentUser])

  const handleBackToLobby = () => {
    // Clear game state
    clearStrokes()
    clearMessages()
    setGameState(null)
    
    // Close popup
    onClose()
    
    // Navigate to home/lobby
    router.push('/')
  }

  const handlePlayAgain = () => {
    // Clear game state
    clearStrokes()
    clearMessages()
    setGameState(null)
    
    // Close popup
    onClose()
    
    // Navigate to home/lobby (not reload)
    router.push('/')
  }

  const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score)

  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      rotateY: -90
    },
    visible: { 
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
        duration: 0.8,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateY: 90,
      transition: {
        duration: 0.5
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-2xl animate-pulse" />
            
            {/* Main Card */}
            <Card className="relative bg-white/95 border-2 border-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 animate-gradient-x" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
              </div>

              <CardContent className="relative p-8 text-center">
                {/* Floating Icons */}
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  className="absolute top-4 left-4"
                >
                  <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                </motion.div>
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: '1s' }}
                  className="absolute top-4 right-4"
                >
                  <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
                </motion.div>
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: '2s' }}
                  className="absolute bottom-4 left-4"
                >
                  <Award className="w-6 h-6 text-blue-400 animate-pulse" />
                </motion.div>
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  style={{ animationDelay: '3s' }}
                  className="absolute bottom-4 right-4"
                >
                  <Medal className="w-6 h-6 text-purple-400 animate-pulse" />
                </motion.div>

                {/* Winner Title */}
                <motion.div variants={itemVariants} className="mb-6">
                  <motion.div
                    variants={pulseVariants}
                    animate="animate"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                  >
                    <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
                    <h1 className="text-4xl md:text-5xl font-black tracking-wider">
                      {isCurrentUser ? 'VICTORY!' : 'WINNER!'}
                    </h1>
                    <Crown className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </motion.div>
                  
                  {isCurrentUser && (
                    <motion.p
                      variants={itemVariants}
                      className="text-lg text-green-400 font-semibold mt-2 animate-pulse"
                    >
                      🎉 Congratulations! You won! 🎉
                    </motion.p>
                  )}
                </motion.div>

                {/* Winner Avatar and Info */}
                <motion.div variants={itemVariants} className="mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative inline-block"
                  >
                    {/* Glowing Ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full animate-spin" 
                         style={{ padding: '4px', animationDuration: '3s' }}>
                      <div className="bg-black rounded-full w-full h-full" />
                    </div>
                    
                    <Avatar className="relative w-32 h-32 border-4 border-white/20">
                      <AvatarImage src={winner.avatar} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600">
                        {winner.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Trophy Badge */}
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2"
                    >
                      <Trophy className="w-6 h-6 text-white" />
                    </motion.div>
                  </motion.div>

                  <motion.h2
                    variants={itemVariants}
                    className="text-3xl font-bold text-black mt-4 mb-2"
                    style={{ color: '#1A202C' }}
                  >
                    {winner.username}
                  </motion.h2>
                  
                  <motion.div
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full px-6 py-2 border border-yellow-400/30"
                  >
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-400">{winner.score}</span>
                    <span className="text-black font-medium" style={{ color: '#1A202C' }}>points</span>
                  </motion.div>
                </motion.div>

                {/* Leaderboard */}
                <motion.div variants={itemVariants} className="mb-8">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center justify-center gap-2" style={{ color: '#1A202C' }}>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Final Rankings
                  </h3>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {sortedPlayers.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl transition-all
                          ${index === 0 ? 'bg-gradient-to-r from-yellow-100/90 to-orange-100/90 border border-yellow-400/50' :
                            index === 1 ? 'bg-gradient-to-r from-gray-100/90 to-gray-200/90 border border-gray-400/50' :
                            index === 2 ? 'bg-gradient-to-r from-orange-100/90 to-yellow-100/90 border border-orange-600/50' :
                            'bg-white/80 border border-gray-200'}
                          ${player.id === winner.id ? 'ring-2 ring-yellow-400/50' : ''}
                        `}
                      >
                        {/* Rank */}
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${index === 0 ? 'bg-yellow-400 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-300 text-black'}
                        `}>
                          {index + 1}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback className="text-xs">
                            {player.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        <span className="flex-1 text-left font-medium text-black" style={{ color: '#1A202C' }}>
                          {player.username}
                          {player.id === winner.id && (
                            <Crown className="inline w-4 h-4 ml-1 text-yellow-400" />
                          )}
                        </span>

                        {/* Score */}
                        <span className="font-bold text-black" style={{ color: '#1A202C' }}>
                          {player.score}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-4 justify-center">
                  <Button
                    onClick={handleBackToLobby}
                    variant="outline"
                    className="bg-white/90 border-gray-300 text-black hover:bg-white font-semibold transition-all duration-300"
                    style={{ color: '#1A202C' }}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Lobby
                  </Button>
                  
                  <Button
                    onClick={handlePlayAgain}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 animate-glow"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}