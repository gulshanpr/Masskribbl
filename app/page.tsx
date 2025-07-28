'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import LoginForm from '@/components/auth/LoginForm'
import QuickPlay from '@/components/lobby/QuickPlay'
import CreateRoom from '@/components/lobby/CreateRoom'
import JoinRoom from '@/components/lobby/JoinRoom'
import { Palette, Sparkles, Users, Trophy, BarChart3, LogOut, User, Star, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster } from 'react-hot-toast'
import ConnectionStatus from '@/components/ui/ConnectionStatus'

// Character emojis for decoration
const characterEmojis = ['🎨', '🖌️', '🎭', '🎪', '🎨', '🌈', '⭐', '🎯', '🎲', '🎊']
const floatingCharacters = ['🐸', '🦄', '🐙', '🦋', '🐢', '🦊', '🐨', '🦁', '🐯', '🐼']

export default function Home() {
  const { user, logout } = useGameStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    logout()
    // Force a page refresh to ensure clean state
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            <span className="loading-character">🎨</span>
            <span className="loading-character">🖌️</span>
            <span className="loading-character">🎭</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">Loading the fun...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Toaster position="top-center" />
        <ConnectionStatus />
        
        {/* Floating Character Decorations */}
        {floatingCharacters.map((char, index) => (
          <motion.div
            key={index}
            className="character-decoration fixed text-4xl"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {char}
          </motion.div>
        ))}

        <div className="relative z-10 p-4">
          <div className="w-full max-w-6xl mx-auto">
            {/* Hero Section */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-12"
            >
              <motion.div
                className="mb-8"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-8xl mb-4">🎨</div>
              </motion.div>

              <motion.h1
                className="text-6xl md:text-8xl font-black mb-6 text-gray-800"
                animate={{ 
                  scale: [1, 1.05, 1],
                  textShadow: [
                    '4px 4px 0px #2D3748',
                    '6px 6px 0px #2D3748',
                    '4px 4px 0px #2D3748'
                  ]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                style={{
                  textShadow: '4px 4px 0px #2D3748',
                  WebkitTextStroke: '2px #2D3748'
                }}
              >
                MassKribbl
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-700 mb-8 font-bold"
              >
                🌈 Draw, Guess, and Have Epic Fun with Friends! 🎉
              </motion.p>
              
              {/* Features */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
              >
                {[
                  { icon: '🎨', text: 'Creative Drawing', color: 'from-red-400 to-pink-500' },
                  { icon: '👥', text: 'Multiplayer Fun', color: 'from-blue-400 to-cyan-500' },
                  { icon: '⚡', text: 'Real-time Play', color: 'from-green-400 to-emerald-500' },
                  { icon: '🏆', text: 'Compete & Win', color: 'from-yellow-400 to-orange-500' }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.8 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                    className="character-card p-6 text-center animate-float-character"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  >
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <p className="text-gray-700 font-bold text-sm">{feature.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Login Form */}
            <div className="flex justify-center">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      <Toaster position="top-center" />
      <ConnectionStatus />
      
      {/* Floating Decorations for Logged In Users */}
      {characterEmojis.map((char, index) => (
        <motion.div
          key={index}
          className="character-decoration fixed text-3xl opacity-20"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {char}
        </motion.div>
      ))}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            {/* User Profile Section */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="character-avatar animate-bounce-fun">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-800">
                  🎨 {user.username}
                </p>
                <p className="text-sm text-gray-600">
                  {user.email}
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => router.push('/leaderboard')}
                  className="fun-button"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  🏆 Leaderboard
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  className="fun-button"
                  style={{
                    background: 'linear-gradient(145deg, #F56565 0%, #FC8181 100%)'
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  👋 Logout
                </Button>
              </motion.div>
            </div>
          </div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-black mb-4 text-gray-800 animate-rainbow-text"
            style={{
              textShadow: '4px 4px 0px #2D3748',
              WebkitTextStroke: '2px #2D3748'
            }}
          >
            🎨 MassKribbl 🎨
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-700 font-bold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Welcome back, <span className="text-red-500">{user.username}</span>! 
            <span className="character-emoji">🎉</span>
          </motion.p>
        </motion.div>

        {/* Game Options */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <QuickPlay />
          <CreateRoom />
          <JoinRoom />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="character-card p-8 max-w-2xl mx-auto">
            <motion.h3 
              className="text-2xl font-black text-gray-800 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎯 Ready to Show Your Artistic Skills? 🎨
            </motion.h3>
            <p className="text-gray-600 mb-6 font-semibold">
              Join thousands of players in the most fun drawing and guessing game online! 
              <span className="character-emoji">🌟</span>
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { number: '1000+', label: 'Active Players', emoji: '👥', color: 'text-blue-600' },
                { number: '50K+', label: 'Games Played', emoji: '🎮', color: 'text-green-600' },
                { number: '24/7', label: 'Fun Available', emoji: '⚡', color: 'text-purple-600' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-3xl mb-2">{stat.emoji}</div>
                  <div className={`text-2xl font-black ${stat.color}`}>{stat.number}</div>
                  <div className="text-sm text-gray-600 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}