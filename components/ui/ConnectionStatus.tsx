'use client'

import React, { useEffect, useState } from 'react'
import { socketManager } from '@/lib/socket'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = socketManager.getSocket()
    
    if (!socket) {
      setIsConnecting(true)
      const newSocket = socketManager.connect()
      
      newSocket.on('connect', () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
      })
      
      newSocket.on('disconnect', () => {
        setIsConnected(false)
        setIsConnecting(false)
      })
      
      newSocket.on('connect_error', (err) => {
        setIsConnected(false)
        setIsConnecting(false)
        setError(err.message)
      })
    } else {
      setIsConnected(socket.connected)
      
      socket.on('connect', () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
      })
      
      socket.on('disconnect', () => {
        setIsConnected(false)
        setIsConnecting(false)
      })
      
      socket.on('connect_error', (err) => {
        setIsConnected(false)
        setIsConnecting(false)
        setError(err.message)
      })
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null // Only show in development
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="glass rounded-lg p-3 flex items-center gap-2">
        {isConnecting && (
          <>
            <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-xs text-white">Connecting...</span>
          </>
        )}
        
        {isConnected && (
          <>
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Connected</span>
          </>
        )}
        
        {!isConnected && !isConnecting && (
          <>
            <WifiOff className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400">Disconnected</span>
          </>
        )}
        
        {error && (
          <div className="relative group">
            <AlertCircle className="w-3 h-3 text-yellow-400 ml-2" />
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 