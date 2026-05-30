import express from 'express'
import { dashboard } from '../services/dashboardService.js'

const router = express.Router()

router.get('/dashboard', (req, res, next) => {
  try {
    return res.json(dashboard())
  } catch (err) {
    return next(err)
  }
})

export default router
