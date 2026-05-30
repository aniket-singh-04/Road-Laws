import express from 'express'
import { routeCheck } from '../services/routeService.js'

const router = express.Router()

router.post('/routes/check', async (req, res, next) => {
  try {
    return res.json(await routeCheck(req.body))
  } catch (err) {
    return next(err)
  }
})

export default router
