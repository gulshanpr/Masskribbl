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
        
        toast.success('Welcome to MassKribbl! 🎨')
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
      
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-md"
    >
      <Card className="glass border-primary/40">
        <CardHeader className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mx-auto mb-4"
          >
            <Palette className="w-12 h-12 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl text-white">
            Welcome to MassKribbl!
          </CardTitle>
          <p className="text-white/60">
            Enter your details to start drawing and guessing
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/40 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-200 text-sm">{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  maxLength={20}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username.trim() || !email.trim()}
              className="w-full h-12 text-lg font-medium animate-glow"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                'Start Playing!'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/50">
              Your account will be created automatically. Just pick a username and start playing!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}