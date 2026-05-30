import { randomUUID } from 'node:crypto'
import type { Request } from 'express'
import { ApiError, sanitizeText } from '../utility/utils.js'
import { requireAdmin } from './authService.js'
import { audit, db } from '../data/store.js'

type LawBody = Record<string, unknown>

export function upsertLaw(req: Request, body: LawBody) {
  const user = requireAdmin(req)
  const id = sanitizeText(body.id || randomUUID(), 100)
  const payload = {
    id,
    countryId: sanitizeText(body.countryId || 'in', 20),
    title: sanitizeText(body.title, 180),
    categoryId: sanitizeText(body.categoryId || 'driving', 80),
    stateId: sanitizeText(body.stateId || 'all', 30),
    tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => sanitizeText(tag, 40)).filter(Boolean) : [],
    section: sanitizeText(body.section, 180),
    legalSource: sanitizeText(body.legalSource, 180),
    effectiveDate: sanitizeText(body.effectiveDate, 30),
    description: sanitizeText(body.description, 1000),
    penalties: Array.isArray(body.penalties) ? body.penalties.map((penalty: unknown) => sanitizeText(penalty, 180)).filter(Boolean) : [],
    relatedLawIds: Array.isArray(body.relatedLawIds) ? body.relatedLawIds.map((lawId: unknown) => sanitizeText(lawId, 100)).filter(Boolean) : [],
  }
  if (!payload.title || !payload.description || !payload.section) throw new ApiError(422, 'Law title, section, and description are required')
  const index = db.laws.findIndex((law) => law.id === id)
  if (index >= 0) db.laws[index] = payload
  else db.laws.unshift(payload)
  audit(user.id, index >= 0 ? 'law.updated' : 'law.created', 'law', { lawId: id })
  return payload
}
