import express from 'express'
import type { Response } from 'express'
import { handleDriveLegalPlanRoutes } from './driveLegalPlanRoutes.js'

const router = express.Router()

router.all('/*', async (req, res, next) => {
  try {
    const handled = await handleDriveLegalPlanRoutes(
      req,
      res,
      req.path || '/',
      new URLSearchParams(req.url.split('?')[1] || ''),
      (rs: Response, status: number, body: unknown) => rs.status(status).json(body),
      (rs: Response, body: unknown) => rs.status(201).json(body),
    )
    if (handled) return
    return next()
  } catch (err) {
    return next(err)
  }
})

export default router
