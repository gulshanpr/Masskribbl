const { createServer } = require('http')
const { Server } = require('socket.io')
const { dbOperations } = require('./supabase')

const httpServer = createServer((req, res) => {
  // Add CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }))
    return
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://masskribbl.vercel.app', 'https://*.vercel.app', 'https://*.vercel.app/*', 'https://masskribbl-git-main-samyakjain.vercel.app', 'https://masskribbl-samyakjain.vercel.app']
      : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  allowUpgrades: true
})

// Game state management (in-memory for real-time features)
const rooms = new Map()
const matchmakingQueue = []
const disconnectedPlayers = new Map() // socketId -> { player, roomCode, timestamp }

// Room management
async function createRoom(hostId, maxPlayers = 8, maxRounds = 3) {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  try {
    console.log('Creating game session with data:', {
      room_code: roomCode,
      host_id: hostId,
      max_players: maxPlayers,
      max_rounds: maxRounds,
      status: 'waiting'
    })
    
    // Create game session in database
    const gameSession = await dbOperations.createGameSession({
      room_code: roomCode,
      host_id: hostId,
      max_players: maxPlayers,
      max_rounds: maxRounds,
      status: 'waiting'
    })

    console.log('Game session created:', gameSession)

    const room = {
      code: roomCode,
      hostId,
      players: [],
      maxPlayers,
      maxRounds,
      currentRound: 0,
      currentDrawer: null,
      currentWord: null,
      wordChoices: null,
      timeLeft: 0,
      status: 'waiting', // waiting, choosing, drawing, finished
      scores: {},
      roundStartTime: null,
      gameId: gameSession.id, // Database ID
      currentRoundId: null,
      correctGuessers: new Set(), // Track who guessed correctly this round
      roundTimer: null
    }
    
    rooms.set(roomCode, room)
    return room
  } catch (error) {
    console.error('Failed to create game session in database:', error)
    console.error('Database error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    throw error
  }
}

async function joinRoom(roomCode, player) {
  const room = rooms.get(roomCode)
  if (!room) return null
  
  if (room.players.length >= room.maxPlayers) return null
  
  // Add player if not already in room
  if (!room.players.find(p => p.id === player.id)) {
    try {
      // Add participant to database
      await dbOperations.addGameParticipant(room.gameId, player.id)
      
      room.players.push({
        ...player,
        score: 0,
        isDrawing: false,
        isReady: false
      })
      room.scores[player.id] = 0
    } catch (error) {
      console.error('Failed to add participant to database:', error)
      // Continue with in-memory operation even if DB fails
      room.players.push({
        ...player,
        score: 0,
        isDrawing: false,
        isReady: false
      })
      room.scores[player.id] = 0
    }
  }
  
  return room
}

async function startGame(roomCode) {
  const room = rooms.get(roomCode)
  if (!room || room.players.length < 2) return false
  
  try {
    // Update game session status in database
    await dbOperations.updateGameSession(room.gameId, {
      status: 'playing',
      current_round: 1
    })
    
    room.status = 'playing'
    room.currentRound = 1
    await startRound(room)
    return true
  } catch (error) {
    console.error('Failed to start game in database:', error)
    // Continue with in-memory operation
    room.status = 'playing'
    room.currentRound = 1
    await startRound(room)
    return true
  }
}

async function startRound(room) {
  // Reset drawing state
  room.players.forEach(p => p.isDrawing = false)
  room.correctGuessers.clear()
  
  // Clear any existing timer
  if (room.roundTimer) {
    clearInterval(room.roundTimer)
    room.roundTimer = null
  }
  
  // Select next drawer (round-robin)
  const drawerIndex = (room.currentRound - 1) % room.players.length
  const drawer = room.players[drawerIndex]
  drawer.isDrawing = true
  room.currentDrawer = drawer.id
  
  try {
    // Get random words from database
    const words = await dbOperations.getRandomWords(3)
    room.wordChoices = words.map(w => w.word)
  } catch (error) {
    console.error('Failed to get words from database, using fallback:', error)
    // Fallback words
    const fallbackWords = [
      'cat', 'house', 'pizza', 'running', 'sun',
      'dog', 'car', 'cake', 'jumping', 'moon',
      'elephant', 'tree', 'burger', 'dancing', 'star',
      'fish', 'phone', 'apple', 'reading', 'cloud',
      'bird', 'chair', 'ice cream', 'swimming', 'rain'
    ]
    room.wordChoices = fallbackWords.sort(() => 0.5 - Math.random()).slice(0, 3)
  }
  
  room.status = 'choosing'
  room.currentWord = null
  room.timeLeft = 15 // 15 seconds to choose word
  
  // Broadcast game state
  broadcastGameState(room)
  
  // Start choosing timer
  setTimeout(() => {
    if (room.status === 'choosing') {
      // Auto-select first word if no choice made
      selectWord(room, room.wordChoices[0])
    }
  }, 15000)
}

async function selectWord(room, word) {
  try {
    // Create round in database
    const gameRound = await dbOperations.createGameRound({
      game_id: room.gameId,
      round_number: room.currentRound,
      drawer_id: room.currentDrawer,
      word: word
    })
    
    room.currentRoundId = gameRound.id
  } catch (error) {
    console.error('Failed to create round in database:', error)
  }
  
  room.currentWord = word
  room.wordChoices = null
  room.status = 'drawing'
  room.timeLeft = 80 // 80 seconds to draw
  room.roundStartTime = Date.now()
  
  broadcastGameState(room)
  
  // Start drawing timer
  room.roundTimer = setInterval(() => {
    room.timeLeft--
    
    // Check if all players (except drawer) have guessed correctly
    const nonDrawerPlayers = room.players.filter(p => p.id !== room.currentDrawer)
    const allGuessedCorrectly = nonDrawerPlayers.length > 0 && 
      nonDrawerPlayers.every(p => room.correctGuessers.has(p.id))
    
    if (room.timeLeft <= 0 || allGuessedCorrectly) {
      clearInterval(room.roundTimer)
      room.roundTimer = null
      
      // If all guessed correctly, wait 5 seconds before ending round
      if (allGuessedCorrectly && room.timeLeft > 5) {
        room.timeLeft = 5
        io.to(room.code).emit('game:allGuessed')
        
        setTimeout(() => {
          endRound(room)
        }, 5000)
      } else {
        endRound(room)
      }
    }
  }, 1000)
}

async function endRound(room) {
  // Clear timer
  if (room.roundTimer) {
    clearInterval(room.roundTimer)
    room.roundTimer = null
  }
  
  try {
    // End round in database
    if (room.currentRoundId) {
      await dbOperations.endGameRound(room.currentRoundId)
    }
    
    // Update game session
    await dbOperations.updateGameSession(room.gameId, {
      current_round: room.currentRound
    })
  } catch (error) {
    console.error('Failed to end round in database:', error)
  }
  
  room.status = 'waiting'
  room.currentDrawer = null
  room.currentWord = null
  room.timeLeft = 0
  room.currentRoundId = null
  room.correctGuessers.clear()
  
  if (room.currentRound >= room.maxRounds) {
    await endGame(room)
  } else {
    room.currentRound++
    setTimeout(() => startRound(room), 3000) // 3 second break between rounds
  }
  
  broadcastGameState(room)
}

async function endGame(room) {
  room.status = 'finished'
  
  try {
    // Update game session as finished
    await dbOperations.updateGameSession(room.gameId, {
      status: 'finished'
    })
    
    // Calculate winner and update user statistics
    const winner = room.players.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    )
    
    // Update stats for all players
    for (const player of room.players) {
      try {
        const won = player.id === winner.id
        await dbOperations.updateUserStats(player.id, player.score, won)
        
        // Update participant final score
        await dbOperations.updateParticipantScore(room.gameId, player.id, player.score)
      } catch (error) {
        console.error(`Failed to update stats for player ${player.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Failed to end game in database:', error)
  }
  
  broadcastGameState(room)
  
  // Clean up room after 30 seconds
  setTimeout(() => {
    rooms.delete(room.code)
  }, 30000)
}

function broadcastGameState(room) {
  const gameState = {
    roomCode: room.code,
    hostId: room.hostId,
    players: room.players,
    currentDrawer: room.currentDrawer,
    currentWord: room.status === 'drawing' ? getWordHint(room.currentWord, 0) : room.currentWord,
    wordChoices: room.wordChoices,
    round: room.currentRound,
    maxRounds: room.maxRounds,
    timeLeft: room.timeLeft,
    status: room.status,
    scores: room.scores
  }
  
  console.log('Broadcasting game state:', {
    roomCode: room.code,
    playerCount: room.players.length,
    status: room.status,
    players: room.players.map(p => p.username)
  })
  
  // Get all sockets in the room
  const roomSockets = io.sockets.adapter.rooms.get(room.code)
  console.log('Sockets in room:', roomSockets ? Array.from(roomSockets) : 'No sockets')
  
  io.to(room.code).emit('game:state', gameState)
  
  // Also emit directly to the socket that just joined
  const sockets = Array.from(io.sockets.sockets.values())
  const targetSocket = sockets.find(s => s.roomCode === room.code && s.userId === room.hostId)
  if (targetSocket) {
    console.log('Emitting game state directly to socket:', targetSocket.id)
    targetSocket.emit('game:state', gameState)
  }
}

function getWordHint(word, revealCount = 0) {
  if (!word) return ''
  if (revealCount === 0) {
    return word.replace(/[a-zA-Z]/g, '_')
  }
  
  const letters = word.split('')
  const indicesToReveal = []
  
  // Always reveal first letter
  indicesToReveal.push(0)
  
  // Reveal random letters based on revealCount
  for (let i = 1; i < Math.min(revealCount, word.length); i++) {
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * word.length)
    } while (indicesToReveal.includes(randomIndex))
    indicesToReveal.push(randomIndex)
  }
  
  return letters.map((letter, index) => 
    indicesToReveal.includes(index) ? letter : '_'
  ).join('')
}

// Matchmaking
function addToMatchmaking(player) {
  matchmakingQueue.push(player)
  
  if (matchmakingQueue.length >= 4) {
    // Create new room with queued players
    const hostPlayer = matchmakingQueue.shift()
    createRoom(hostPlayer.id, 8, 3).then(room => {
      // Add host
      joinRoom(room.code, hostPlayer)
      
      // Add other players
      const promises = []
      while (matchmakingQueue.length > 0 && room.players.length < room.maxPlayers) {
        const player = matchmakingQueue.shift()
        promises.push(joinRoom(room.code, player))
      }
      
      Promise.all(promises).then(() => {
        // Notify all players
        room.players.forEach(player => {
          const socket = [...io.sockets.sockets.values()].find(s => s.userId === player.id)
          if (socket) {
            socket.join(room.code)
            socket.emit('matchmaking:found', room.code)
          }
        })
        
        broadcastGameState(room)
      })
    }).catch(error => {
      console.error('Failed to create matchmaking room:', error)
    })
  }
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  console.log('Connection details:', {
    transport: socket.conn.transport.name,
    remoteAddress: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent'],
    origin: socket.handshake.headers.origin
  })
  
  socket.on('room:create', async ({ hostId, maxPlayers, maxRounds }) => {
    console.log('Received room:create event:', { hostId, maxPlayers, maxRounds })
    try {
      console.log('Creating room...')
      const room = await createRoom(hostId, maxPlayers, maxRounds)
      console.log('Room created successfully:', room.code)
      socket.emit('room:created', room.code)
    } catch (error) {
      console.error('Failed to create room:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      socket.emit('error', 'Failed to create room')
    }
  })
  
  socket.on('room:join', async ({ roomCode, player }) => {
    console.log('Received room:join event:', { roomCode, player: player.username })
    try {
      const room = await joinRoom(roomCode, player)
      if (!room) {
        console.log('Room not found or full:', roomCode)
        socket.emit('error', 'Room not found or full')
        return
      }
      
      console.log('Successfully joined room:', roomCode)
      socket.join(roomCode)
      socket.userId = player.id
      socket.roomCode = roomCode
      socket.emit('room:joined')
      
      // Wait a bit for the socket to be properly joined to the room
      setTimeout(() => {
        console.log('Broadcasting game state to room:', roomCode)
        console.log('Socket rooms:', Array.from(socket.rooms))
        broadcastGameState(room)
      }, 100)
    } catch (error) {
      console.error('Failed to join room:', error)
      socket.emit('error', 'Failed to join room')
    }
  })
  
  socket.on('game:start', async () => {
    if (!socket.roomCode) return
    
    const room = rooms.get(socket.roomCode)
    if (!room || room.hostId !== socket.userId) return
    
    try {
      if (await startGame(socket.roomCode)) {
        io.to(socket.roomCode).emit('game:started')
      }
    } catch (error) {
      socket.emit('error', 'Failed to start game')
    }
  })
  
  socket.on('game:selectWord', async (word) => {
    if (!socket.roomCode) return
    
    const room = rooms.get(socket.roomCode)
    if (!room || room.currentDrawer !== socket.userId) return
    
    await selectWord(room, word)
  })
  
  socket.on('drawing:stroke', async (stroke) => {
    if (!socket.roomCode) return
    
    const room = rooms.get(socket.roomCode)
    if (!room || room.currentDrawer !== socket.userId) return
    
    try {
      // Save stroke to database
      await dbOperations.saveDrawingStroke({
        game_id: room.gameId,
        round_id: room.currentRoundId,
        player_id: socket.userId,
        stroke_data: stroke
      })
    } catch (error) {
      console.error('Failed to save drawing stroke:', error)
    }
    
    socket.to(socket.roomCode).emit('drawing:stroke', stroke)
  })
  
  socket.on('drawing:clear', async () => {
    if (!socket.roomCode) return
    
    const room = rooms.get(socket.roomCode)
    if (!room || room.currentDrawer !== socket.userId) return
    
    try {
      // Clear strokes from database
      if (room.currentRoundId) {
        await dbOperations.clearDrawingStrokes(room.gameId, room.currentRoundId)
      }
    } catch (error) {
      console.error('Failed to clear drawing strokes:', error)
    }
    
    socket.to(socket.roomCode).emit('drawing:clear')
  })
  
  socket.on('chat:message', async (message) => {
    if (!socket.roomCode) return
    
    const room = rooms.get(socket.roomCode)
    if (!room) return
    
    // Prevent duplicate messages by checking timestamp and user
    const recentMessages = room.recentMessages || []
    const isDuplicate = recentMessages.some(msg => 
      msg.playerId === message.playerId && 
      msg.message === message.message &&
      Date.now() - msg.timestamp < 1000 // Within 1 second
    )
    
    if (isDuplicate) return
    
    // Store recent message to prevent duplicates
    if (!room.recentMessages) room.recentMessages = []
    room.recentMessages.push({
      playerId: message.playerId,
      message: message.message,
      timestamp: Date.now()
    })
    
    // Keep only last 10 messages for duplicate checking
    if (room.recentMessages.length > 10) {
      room.recentMessages = room.recentMessages.slice(-10)
    }
    
    // Check if message is a correct guess
    let isCorrect = false
    if (room.status === 'drawing' && 
        room.currentWord && 
        message.playerId !== room.currentDrawer &&
        !room.correctGuessers.has(message.playerId) &&
        message.message.toLowerCase().trim() === room.currentWord.toLowerCase()) {
      
      isCorrect = true
      room.correctGuessers.add(message.playerId)
      
      // Award points
      const timeBonus = Math.max(0, Math.floor(room.timeLeft / 10))
      const points = 100 + timeBonus
      
      const player = room.players.find(p => p.id === message.playerId)
      if (player) {
        player.score += points
        room.scores[message.playerId] = player.score
      }
      
      // Award points to drawer too
      const drawer = room.players.find(p => p.id === room.currentDrawer)
      if (drawer) {
        drawer.score += 50
        room.scores[room.currentDrawer] = drawer.score
      }
      
      broadcastGameState(room)
    }
    
    const chatMessage = {
      ...message,
      isCorrect
    }
    
    try {
      // Save chat message to database
      await dbOperations.saveChatMessage({
        game_id: room.gameId,
        player_id: message.playerId,
        message: message.message,
        is_guess: room.status === 'drawing',
        is_correct: isCorrect
      })
    } catch (error) {
      console.error('Failed to save chat message:', error)
    }
    
    io.to(socket.roomCode).emit('chat:message', chatMessage)
  })
  
  socket.on('matchmaking:join', ({ player }) => {
    socket.userId = player.id
    addToMatchmaking(player)
  })
  
  socket.on('ping', (data) => {
    console.log('Received ping from socket:', socket.id, data)
    socket.emit('pong', { message: 'pong', timestamp: Date.now() })
  })

  socket.on('game:requestState', ({ roomCode }) => {
    console.log('Received game state request for room:', roomCode)
    const room = rooms.get(roomCode)
    if (room) {
      console.log('Sending game state to requesting socket')
      broadcastGameState(room)
    } else {
      console.log('Room not found for state request:', roomCode)
    }
  })

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id)
    
    // Remove from matchmaking queue
    const queueIndex = matchmakingQueue.findIndex(p => p.id === socket.userId)
    if (queueIndex !== -1) {
      matchmakingQueue.splice(queueIndex, 1)
    }
    
    // Only remove player if room is being deleted or after a delay
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode)
      if (room) {
        // Don't immediately remove player - give them time to reconnect
        setTimeout(() => {
          const currentRoom = rooms.get(socket.roomCode)
          if (currentRoom) {
            const stillConnected = [...io.sockets.sockets.values()].some(s => 
              s.userId === socket.userId && s.roomCode === socket.roomCode
            )
            
            if (!stillConnected) {
              // Remove player after delay if still not connected
              currentRoom.players = currentRoom.players.filter(p => p.id !== socket.userId)
              
              if (currentRoom.players.length === 0) {
                rooms.delete(socket.roomCode)
              } else {
                if (currentRoom.hostId === socket.userId) {
                  currentRoom.hostId = currentRoom.players[0].id
                }
                broadcastGameState(currentRoom)
              }
            }
          }
        }, 5000) // 5 second grace period
      }
    }
  })

  // Add reconnection handler
  socket.on('room:reconnect', async ({ roomCode, player }) => {
    const disconnectedPlayer = disconnectedPlayers.get(socket.id)
    
    if (disconnectedPlayer && 
        disconnectedPlayer.roomCode === roomCode && 
        disconnectedPlayer.player.id === player.id) {
      
      // Remove from disconnected players
      disconnectedPlayers.delete(socket.id)
      
      // Rejoin room
      const room = rooms.get(roomCode)
      if (room) {
        // Add player back if not already in room
        if (!room.players.find(p => p.id === player.id)) {
          room.players.push({
            ...player,
            score: room.scores[player.id] || 0,
            isDrawing: false,
            isReady: false
          })
        }
        
        socket.join(roomCode)
        socket.userId = player.id
        socket.roomCode = roomCode
        
        broadcastGameState(room)
      }
    }
  })
})

// Clean up disconnected players periodically
setInterval(() => {
  const now = Date.now()
  for (const [socketId, data] of disconnectedPlayers.entries()) {
    if (now - data.timestamp > 30000) { // 30 seconds
      disconnectedPlayers.delete(socketId)
    }
  }
}, 10000) // Check every 10 seconds

const PORT = process.env.PORT || 8080

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO server running on port ${PORT}`)
  console.log('Environment variables check:')
  console.log('- SUPABASE_URL:', !!process.env.SUPABASE_URL)
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- Health check available at: http://localhost:${PORT}/health')
})