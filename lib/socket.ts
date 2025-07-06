import { io, Socket } from 'socket.io-client'

export interface DrawingStroke {
  id: string
  points: { x: number; y: number }[]
  color: string
  size: number
  tool: 'brush' | 'eraser' | 'line' | 'rectangle' | 'square' | 'circle' | 'dotted'
  timestamp: number
}

export interface Player {
  id: string
  username: string
  avatar: string
  score: number
  isDrawing: boolean
  isReady: boolean
}

export interface GameState {
  roomCode: string
  hostId: string
  players: Player[]
  currentDrawer: string | null
  currentWord: string | null
  wordChoices: string[] | null
  round: number
  maxRounds: number
  timeLeft: number
  status: 'waiting' | 'choosing' | 'drawing' | 'finished'
  scores: Record<string, number>
}

export interface ChatMessage {
  id: string
  playerId: string
  username: string
  message: string
  timestamp: number
  isGuess: boolean
  isCorrect?: boolean
}

class SocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

    connect(): Socket {
    if (this.socket?.connected) {
      return this.socket
    }
  
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://masskribbl-production.up.railway.app' : 'http://localhost:3001')
    
    console.log('Connecting to socket URL:', socketUrl)
    console.log('Environment:', process.env.NODE_ENV)
    console.log('NEXT_PUBLIC_SOCKET_URL:', process.env.NEXT_PUBLIC_SOCKET_URL)
  
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 30000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
  
    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.reconnectAttempts = 0
    })
  
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      // Try to reconnect after a short delay
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect()
        }
      }, 1000)
    })
  
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      console.error('Error message:', error.message)
      this.handleReconnect()
    })
  
    return this.socket
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`)
        this.socket?.connect()
      }, Math.pow(2, this.reconnectAttempts) * 1000)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

export const socketManager = new SocketManager()