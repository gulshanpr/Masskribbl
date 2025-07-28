'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { dbOperations } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Palette, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useGameStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !email.trim()) return

    setIsLoading(true)
    setError('')

    try {
      // Check if user already exists
      let user = await dbOperations.getUserByEmail(email.trim())
      
      if (user) {
        // User exists, check if username matches
        if (user.username !== username.trim()) {
          setError('Email already registered with a different username')
          setIsLoading(false)
          return
        }
      } else {
        // Create new user
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`
        
        user = await dbOperations.createUser({
          email: email.trim(),
          username: username.trim(),
          avatar_url: avatarUrl
        })
        
        toast.success('🎉 Welcome to MassKribbl! 🎨')
      }

      // Set user in store
      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      })

    } catch (error: any) {
      console.error('Login failed:', error)
      
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('username')) {
          setError('Username already taken. Please choose a different one.')
        } else {
          setError('Email already registered with a different username.')
        }
      } else {
        setError('Failed to create account. Please try again.')
      }
      
      toast.error('❌ Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      className="w-full max-w-md"
    >
      <div className="character-card p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 p-6 text-center relative">
          {/* Floating decorations */}
          <motion.div
            className="absolute top-2 left-4 text-2xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute top-4 right-6 text-xl"
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎨
          </motion.div>
          <motion.div
            className="absolute bottom-2 left-6 text-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💫
          </motion.div>

          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="mx-auto mb-4 text-6xl"
          >
            🎭
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2" style={{ textShadow: '2px 2px 0px #2D3748' }}>
            Join the Fun!
          </h2>
          <p className="text-white/90 font-semibold">
            🌈 Enter your details to start drawing and guessing! 🎉
          </p>
        </div>

        <div className="p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-red-100 border-3 border-red-400 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm font-semibold">{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🎨 Choose Your Artist Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your creative username"
                  className="fun-input w-full pl-12"
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📧 Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="fun-input w-full pl-12"
                  required
                />
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                disabled={isLoading || !username.trim() || !email.trim()}
                className="fun-button w-full h-14 text-lg font-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-2xl animate-spin">🎨</div>
                    <span>Creating Your Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <span>START PLAYING!</span>
                    <span className="text-2xl">🎉</span>
                  </div>
                )}
              </button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-medium">
              🎭 Your account will be created automatically. Just pick a username and start playing! 🎨
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}