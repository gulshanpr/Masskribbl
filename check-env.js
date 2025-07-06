const https = require('https')

const socketUrl = 'https://masskribbl-production.up.railway.app'

console.log('Checking server environment...')

// Test health endpoint
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

healthCheck()
  .then(() => {
    console.log('\nServer is running and accessible')
  })
  .catch((error) => {
    console.error('Server health check failed:', error.message)
  }) 