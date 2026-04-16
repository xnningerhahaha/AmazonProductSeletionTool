import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRouter from './routes/analyze.js'
import statsRouter from './routes/stats.js'

// Load environment variables
dotenv.config()

// Validate required environment variables
const validateEnv = () => {
  const requiredEnvVars = ['PORT', 'NODE_ENV']
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`)
  }
}

validateEnv()

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// API routes
app.use('/api/analyze', analyzeRouter)
app.use('/api/stats', statsRouter)

// 404 handler for undefined routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  })
})

// Global error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack)
  
  // Check if response headers have already been sent
  if (res.headersSent) {
    return
  }
  
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: NODE_ENV === 'development' ? err.message : 'Internal server error',
    },
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📝 Environment: ${NODE_ENV}`)
  console.log(`🌐 CORS enabled for: ${corsOptions.origin}`)
})
