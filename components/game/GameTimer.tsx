'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { Progress } from '@/components/ui/progress'
import { Clock } from 'lucide-react'

export default function GameTimer() {
  const { gameState } = useGameStore()
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!gameState || gameState.status !== 'drawing') {
      setTimeLeft(0)
      return
    }

    setTimeLeft(gameState.timeLeft)

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState])

  if (!gameState || gameState.status !== 'drawing') return null

  const totalTime = 80 // 80 seconds per round
  const progress = (timeLeft / totalTime) * 100

  const getTimerColor = () => {
    if (timeLeft > 40) return 'text-green-400'
    if (timeLeft > 20) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getProgressColor = () => {
    if (timeLeft > 40) return 'bg-green-500'
    if (timeLeft > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass rounded-lg p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <Clock className={`w-5 h-5 ${getTimerColor()}`} />
        <span className="text-white font-medium">Time Remaining</span>
      </div>
      
      <div className="space-y-3">
        <div className={`text-3xl font-bold text-center ${getTimerColor()}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        
        <div className="relative">
          <Progress value={progress} className="h-3" />
          <div 
            className={`absolute inset-0 h-3 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {timeLeft <= 10 && timeLeft > 0 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-center text-red-400 font-medium"
          >
            Hurry up!
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}