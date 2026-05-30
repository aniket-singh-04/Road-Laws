import express from 'express'
import { calculateCompliance } from '../services/complianceService.js'

const router = express.Router()

router.post('/compliance/score', async (req, res, next) => {
  try {
    return res.json(await calculateCompliance(req.body))
  } catch (err) {
    return next(err)
  }
})

export default router
