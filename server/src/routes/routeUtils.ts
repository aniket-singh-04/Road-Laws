import type { Request } from 'express'

export function toSearchParams(req: Request): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) params.append(key, String(item))
      }
    } else if (value !== undefined) {
      params.set(key, String(value))
    }
  }
  return params
}
