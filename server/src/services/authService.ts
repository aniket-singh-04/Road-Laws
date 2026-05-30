import type { Request } from 'express'
import { ApiError } from '../utility/utils.js'
import { db } from '../data/store.js'

const adminRoles = new Set(['traffic_officer', 'state_admin', 'super_admin'])

export function currentUser(req: Request) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  return db.users.find((user) => user.sessions.some((session) => session.accessToken === token)) || null
}

export function requireUser(req: Request) {
  const user = currentUser(req)
  if (!user) throw new ApiError(401, 'Authentication required')
  return user
}

export function requireAdmin(req: Request) {
  const user = requireUser(req)
  if (!adminRoles.has(user.role)) throw new ApiError(403, 'Admin permission required')
  return user
}
