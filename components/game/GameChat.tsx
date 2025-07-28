'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { socketManager, ChatMessage } from '@/lib/socket'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, MessageCircle, X } from 'lucide-react'

export default function GameChat() {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    messages,
    addMessage,
    showChat,
    setShowChat,
    gameState,
    user
  } = useGameStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Socket listeners
  useEffect(() => {
    const socket = socketManager.getSocket()
    if (!socket) return

    const handleChatMessage = (chatMessage: ChatMessage) => {
      addMessage(chatMessage)
    }

    socket.on('chat:message', handleChatMessage)

    return () => {
      socket.off('chat:message', handleChatMessage)
    }
  }, [addMessage])

  const sendMessage = () => {
    if (!message.trim() || !user) return

    const chatMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${user.id}`,
      playerId: user.id,
      username: user.username,
      message: message.trim(),
      timestamp: Date.now(),
      isGuess: gameState?.status === 'drawing'
    }

    const socket = socketManager.getSocket()
    if (socket) {
      socket.emit('chat:message', chatMessage)
    }

    setMessage('')
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  // Deduplicate messages
  const uniqueMessages = messages.filter((message, index, self) => 
    index === self.findIndex(m => m.id === message.id)
  )

  return (
    <>
      {/* Mobile Chat Toggle */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowChat(!showChat)}
        className="md:hidden fixed bottom-4 right-4 z-50 glass rounded-full p-3 text-white"
      >
        {showChat ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed md:relative right-0 top-0 h-full w-80 md:w-full glass rounded-lg flex flex-col z-40"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex items-center justify-between">
              <h3 className="font-semibold text-black flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat
              </h3>
              <button
                onClick={() => setShowChat(false)}
                className="md:hidden text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {uniqueMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      flex gap-3 chat-message
                      ${msg.isCorrect ? 'bg-green-500/20 rounded-lg p-2' : ''}
                    `}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`} />
                      <AvatarFallback className="text-xs">
                        {msg.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-black truncate">
                          {msg.username}
                        </span>
                        {msg.isCorrect && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            Correct!
                          </span>
                        )}
                      </div>
                      <p className={`
                        text-sm break-words
                        ${msg.isCorrect ? 'text-green-200' : 'text-gray-800'}
                      `}>
                        {msg.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    gameState?.status === 'drawing' 
                      ? "Guess the word..." 
                      : "Type a message..."
                  }
                  className="flex-1 bg-white/10 border-white/20 text-black placeholder:text-black"
                  maxLength={100}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}