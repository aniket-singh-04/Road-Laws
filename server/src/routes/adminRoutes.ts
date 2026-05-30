import express from 'express'
import { paginate } from '../utility/utils.js'
import { requireAdmin } from '../services/authService.js'
import { upsertLaw } from '../services/adminService.js'
import { db } from '../data/store.js'

const router = express.Router()

router.get('/admin/audit-logs', (req, res, next) => {
  try {
    requireAdmin(req)
    const searchParams = new URLSearchParams(req.url.split('?')[1] || '')
    return res.json(paginate(db.auditLogs, searchParams))
  } catch (err) {
    return next(err)
  }
})

router.post('/admin/laws', async (req, res, next) => {
  try {
    const created = await upsertLaw(req, req.body)
    return res.status(201).json({ data: created })
  } catch (err) {
    return next(err)
  }
})

export default router
