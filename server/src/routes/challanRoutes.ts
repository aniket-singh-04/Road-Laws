import express from 'express'
import { calculateChallan, decodeChallan } from '../services/challanService.js'

const router = express.Router()

router.post('/challans/decode', async (req, res, next) => {
  try {
    return res.json(await decodeChallan(req.body))
  } catch (err) {
    return next(err)
  }
})

router.post('/challans/calculate', async (req, res, next) => {
  try {
    return res.json(await calculateChallan(req.body))
  } catch (err) {
    return next(err)
  }
})

router.post('/challan/calculate', async (req, res, next) => {
  try {
    return res.json(await calculateChallan(req.body))
  } catch (err) {
    return next(err)
  }
})

export default router
