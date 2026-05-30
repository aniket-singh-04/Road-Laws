import type { Request, Response } from 'express'
import { ApiError, readBody } from '../utility/utils.js'
import {
  createDriveLegalRecord,
  deleteDriveLegalRecord,
  detectLocation,
  getDriveLegalRecord,
  listDriveLegalCollection,
  lookupFine,
  updateDriveLegalRecord,
} from '../repositories/driveLegalPlanRepository.js'

const routeCollections = new Map([
  ['/jurisdictions', 'jurisdictions'],
  ['/vehicle-types', 'vehicle-types'],
  ['/fines', 'fines'],
  ['/challan-calculators', 'challan-calculators'],
  ['/documents', 'documents'],
  ['/users', 'users'],
  ['/audit-logs', 'audit-logs'],
])

function collectionFromPath(path: string) {
  for (const [prefix, collection] of routeCollections) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return { prefix, collection }
  }
  if (path === '/laws' || path.startsWith('/laws/')) return { prefix: '/laws', collection: 'laws' }
  if (path === '/violations' || path.startsWith('/violations/')) return { prefix: '/violations', collection: 'violations' }
  if (path === '/countries' || path.startsWith('/countries/')) return { prefix: '/countries', collection: 'countries' }
  return null
}

type SendJson = (res: Response, status: number, body: unknown) => Response
type CreatedJson = (res: Response, body: unknown) => Response

export async function handleDriveLegalPlanRoutes(req: Request, res: Response, path: string, query: URLSearchParams, send: SendJson, created: CreatedJson) {
  if (req.method === 'POST' && path === '/location/detect') return send(res, 200, await detectLocation(await readBody(req)))
  if (req.method === 'POST' && path === '/fines/lookup') return send(res, 200, await lookupFine(await readBody(req)))

  const target = collectionFromPath(path)
  if (!target) return false

  const id = path === target.prefix ? '' : decodeURIComponent(path.slice(target.prefix.length + 1))
  if (req.method === 'GET' && path === target.prefix) return send(res, 200, await listDriveLegalCollection(target.collection, query))
  if (req.method === 'GET' && id) {
    const result = await getDriveLegalRecord(target.collection, id)
    if (!result) throw new ApiError(404, 'Record not found')
    return send(res, 200, result)
  }
  if (req.method === 'POST' && path === target.prefix) return created(res, await createDriveLegalRecord(target.collection, await readBody(req)))
  if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
    const result = await updateDriveLegalRecord(target.collection, id, await readBody(req))
    if (!result) throw new ApiError(404, 'Record not found')
    return send(res, 200, result)
  }
  if (req.method === 'DELETE' && id) {
    const result = await deleteDriveLegalRecord(target.collection, id)
    if (!result) throw new ApiError(404, 'Record not found')
    return send(res, 200, result)
  }

  return false
}
