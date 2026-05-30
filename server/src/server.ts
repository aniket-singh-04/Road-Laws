import express from 'express'
import type { ErrorRequestHandler } from 'express'
import { connectMongo } from './database/mongoClient.js'
import { config } from './config/config.js'
import router from './routes/routes.js'

const port = config.port

const app = express()
app.use(express.json())

// CORS and common headers
app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', config.corsOrigin)
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('access-control-allow-headers', 'content-type,authorization')
  next()
})

// Health/options
app.options('*', (req, res) => res.sendStatus(204))

// OpenAPI docs (kept at /api/docs)
app.get('/api/docs', (req, res) => {
  // import dynamically to avoid circular import issues
  // `openApi` is exported from routes module
  import('./routes/openApi.js').then((m) => res.json(m.openApi)).catch(() => res.sendStatus(404))
})

// Mount API v1 router
app.use('/api/v1', router)

// Error handler (format similar to previous handler)
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err && err.status ? err.status : 500
  return res.status(status).json({
    error: {
      message: status === 500 ? 'Internal server error' : err.message,
      details: err.details,
    },
  })
}

app.use(errorHandler)

const status = await connectMongo()
console.log(status.message)

app.listen(port, () => {
  console.log(`DriveLegal API listening on http://localhost:${port}`)
})
