const { io } = require('socket.io-client')

const socketUrl = 'https://masskribbl-production.up.railway.app'

console.log('Testing room joining...')

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
})

socket.on('connect', () => {
  console.log('✅ Connected successfully!')
  console.log('Socket ID:', socket.id)
  
  // First create a room
  socket.emit('room:create', {
    hostId: 'test-user-123',
    maxPlayers: 4,
    maxRounds: 2
  })
  
  socket.on('room:created', (roomCode) => {
    console.log('✅ Room created:', roomCode)
    
    // Now try to join the room
    socket.emit('room:join', {
      roomCode,
      player: {
        id: 'test-user-123',
        username: 'TestUser',
        avatar: 'https://example.com/avatar.png'
      }
    })
  })
  
  socket.on('room:joined', () => {
    console.log('✅ Room joined successfully')
  })
  
  socket.on('game:state', (state) => {
    console.log('✅ Game state received:', {
      roomCode: state.roomCode,
      playerCount: state.players.length,
      status: state.status,
      players: state.players.map(p => p.username)
    })
    socket.disconnect()
    process.exit(0)
  })
  
  socket.on('error', (error) => {
    console.error('❌ Error:', error)
    socket.disconnect()
    process.exit(1)
  })
  
  // Timeout after 15 seconds
  setTimeout(() => {
    console.error('❌ Test timeout')
    socket.disconnect()
    process.exit(1)
  }, 15000)
})

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message)
  process.exit(1)
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
}) 