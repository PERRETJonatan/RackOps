import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeDatabase } from './db/init.js'
import racksRouter from './routes/racks.js'
import devicesRouter from './routes/devices.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/racks', racksRouter)
app.use('/api/devices', devicesRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase()
    console.log('✓ Database initialized')
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`)
      console.log(`✓ API base: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
