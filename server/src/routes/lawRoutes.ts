import express from 'express'
import { ApiError } from '../utility/utils.js'
import {
  getLaw,
  getViolation,
  listCategories,
  listCountries,
  listNotifications,
  listStates,
  listZones,
  searchLaws,
  searchTrafficRules,
  searchViolations,
} from './catalogRoutes.js'
import { databaseStatus } from '../repositories/legalRepository.js'
import { toSearchParams } from './routeUtils.js'

const router = express.Router()

router.get('/status', (req, res, next) => {
  try {
    return res.json({ database: databaseStatus() })
  } catch (err) {
    return next(err)
  }
})

router.get('/countries', async (req, res, next) => {
  try {
    return res.json(await listCountries())
  } catch (err) {
    return next(err)
  }
})

router.get('/states', async (req, res, next) => {
  try {
    return res.json(await listStates())
  } catch (err) {
    return next(err)
  }
})

router.get('/categories', async (req, res, next) => {
  try {
    return res.json(await listCategories())
  } catch (err) {
    return next(err)
  }
})

router.get('/traffic-rules', async (req, res, next) => {
  try {
    return res.json(await searchTrafficRules(toSearchParams(req)))
  } catch (err) {
    return next(err)
  }
})

router.get('/laws', async (req, res, next) => {
  try {
    return res.json(await searchLaws(toSearchParams(req)))
  } catch (err) {
    return next(err)
  }
})

router.get('/laws/:id', async (req, res, next) => {
  try {
    const result = await getLaw(decodeURIComponent(req.params.id))
    if (!result) throw new ApiError(404, 'Law not found')
    return res.json(result)
  } catch (err) {
    return next(err)
  }
})

router.get('/violations', async (req, res, next) => {
  try {
    return res.json(await searchViolations(toSearchParams(req)))
  } catch (err) {
    return next(err)
  }
})

router.get('/violations/:id', async (req, res, next) => {
  try {
    const result = await getViolation(decodeURIComponent(req.params.id))
    if (!result) throw new ApiError(404, 'Violation not found')
    return res.json(result)
  } catch (err) {
    return next(err)
  }
})

router.get('/zones', async (req, res, next) => {
  try {
    return res.json(await listZones(toSearchParams(req)))
  } catch (err) {
    return next(err)
  }
})

router.get('/notifications', async (req, res, next) => {
  try {
    return res.json(await listNotifications())
  } catch (err) {
    return next(err)
  }
})

export default router
