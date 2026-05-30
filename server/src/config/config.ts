import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'drivelegal',
  mongodbDatabase: process.env.MONGODB_DATABASE || 'drivelegal',
}

