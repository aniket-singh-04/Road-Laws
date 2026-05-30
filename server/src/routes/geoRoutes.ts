import express from 'express'
import { geoLookup, nearbyZones } from '../services/geoService.js'

const router = express.Router()

router.get('/zones/nearby', (req, res, next) => {
  try {
    return res.json({ data: nearbyZones(req.query.lat, req.query.lng) })
  } catch (err) {
    return next(err)
  }
})

router.post('/geo/lookup', async (req, res, next) => {
  try {
    return res.json(await geoLookup(req.body))
  } catch (err) {
    return next(err)
  }
})

export default router
