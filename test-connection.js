const { io } = require('socket.io-client')

const socketUrl = 'https://masskribbl-production.up.railway.app'

console.log('Testing connection to:', socketUrl)

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
})

socket.on('connect', () => {
  console.log('✅ Connected successfully!')
  console.log('Socket ID:', socket.id)
  console.log('Transport:', socket.io.engine.transport.name)
  
  // Test room creation
  socket.emit('room:create', {
    hostId: 'test-user-123',
    maxPlayers: 4,
    maxRounds: 2
  })
  
  socket.on('room:created', (roomCode) => {
    console.log('✅ Room created successfully:', roomCode)
    socket.disconnect()
    process.exit(0)
  })
  
  socket.on('error', (error) => {
    console.error('❌ Room creation failed:', error)
    socket.disconnect()
    process.exit(1)
  })
  
  // Timeout after 10 seconds
  setTimeout(() => {
    console.error('❌ Room creation timeout')
    socket.disconnect()
    process.exit(1)
  }, 10000)
})

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message)
  console.error('Error details:', error)
  process.exit(1)
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
})

// Test HTTP health endpoint first
const https = require('https')

const healthCheck = () => {
  return new Promise((resolve, reject) => {
    const req = https.get(`${socketUrl}/health`, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          console.log('✅ Health check passed:', result)
          resolve(result)
        } catch (e) {
          reject(new Error('Invalid JSON response'))
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('❌ Health check failed:', error.message)
      reject(error)
    })
    
    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Health check timeout'))
    })
  })
}

// Run health check first, then socket test
healthCheck()
  .then(() => {
    console.log('\nStarting socket connection test...')
  })
  .catch((error) => {
    console.error('Health check failed, but continuing with socket test...')
    console.log('\nStarting socket connection test...')
  }) 