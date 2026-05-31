import { createHash, randomUUID } from 'node:crypto'

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details: unknown = undefined) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function json(res: import('node:http').ServerResponse, status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    ...extraHeaders,
  })
  res.end(JSON.stringify(body))
}

export async function readBody(req: import('node:http').IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    throw new ApiError(400, 'Request body must be valid JSON')
  }
}

export function sanitizeText(value: unknown, max = 500): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[<>]/g, '').trim().slice(0, max)
}

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => !body[field])
  if (missing.length) throw new ApiError(422, 'Missing required fields', { missing })
}

export function paginate<T>(items: T[], query: URLSearchParams) {
  const page = Math.max(Number(query.get('page') || 1), 1)
  const rawPageSize = query.get('pageSize') || query.get('pagesize') || query.get('page_size') || String(query.get('pagesize'))
  const pageSize = Math.min(Math.max(Number(rawPageSize || 10), 1), 50)
  const start = (page - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    meta: { page, pageSize, total: items.length, totalPages: Math.ceil(items.length / pageSize) || 1 },
  }
}

export function filterBySearch<T extends Record<string, unknown>>(items: T[], term: string | null, fields: string[]) {
  const needle = sanitizeText(term || '').toLowerCase()
  if (!needle) return items
  return items.filter((item) => fields.some((field) => String(item[field] || '').toLowerCase().includes(needle)))
}

export function createToken(payload: Record<string, unknown>) {
  const token = `${randomUUID()}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`
  return token
}

export function hashSecret(secret: string) {
  return createHash('sha256').update(secret).digest('hex')
}

export function daysUntil(dateText: string, now = new Date()): number {
  const end = new Date(`${dateText}T00:00:00.000Z`)
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return Math.ceil((end.getTime() - start.getTime()) / 86_400_000)
}

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earth = 6_371_000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earth * Math.asin(Math.sqrt(h))
}
