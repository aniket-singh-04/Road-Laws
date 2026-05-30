import { ObjectId } from 'mongodb'
import type { Document } from 'mongodb'
import { collection, isMongoReady } from '../database/mongoClient.js'
import { driveLegalSeedCollections } from '../data/driveLegalPlanData.js'
import { ApiError, paginate, sanitizeText } from '../utility/utils.js'

type JsonRecord = Record<string, unknown>

const collectionAliases: Record<string, string> = {
  fines: 'fineRules',
  documents: 'legalDocuments',
  'vehicle-types': 'vehicleTypes',
  'challan-calculators': 'challanCalculators',
  'audit-logs': 'auditLogs',
}

const writableCollections = new Set([
  'countries',
  'jurisdictions',
  'vehicleTypes',
  'laws',
  'violations',
  'fineRules',
  'challanCalculators',
  'legalDocuments',
  'users',
  'auditLogs',
])

const memoryCollections = structuredClone(driveLegalSeedCollections)

function canonicalName(name: string) {
  const resolved = collectionAliases[name] || name
  if (!writableCollections.has(resolved)) throw new ApiError(404, 'Collection not found')
  return resolved
}

function toPublicRecord(record: unknown): unknown {
  if (!record || typeof record !== 'object') return record
  const objectRecord = record as JsonRecord
  return { ...objectRecord, _id: String(objectRecord._id) }
}

function looksLikeObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)
}

function mongoize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(mongoize)
  if (!value || typeof value !== 'object') return value
  const next: JsonRecord = {}
  for (const [key, entry] of Object.entries(value)) {
    next[key] = (key === '_id' || key.endsWith('Id') || key === 'changedBy') && looksLikeObjectId(entry) ? new ObjectId(String(entry)) : mongoize(entry)
  }
  return next
}

function memoryList(name: string) {
  return (memoryCollections as Record<string, JsonRecord[]>)[name] || []
}

function filterMemory(records: JsonRecord[], query: URLSearchParams) {
  const q = sanitizeText(query.get('q') || query.get('search') || '', 100).toLowerCase()
  const active = query.get('active')
  let items = records
  if (q) {
    items = items.filter((record) => JSON.stringify(record).toLowerCase().includes(q))
  }
  if (active === 'true' || active === 'false') {
    items = items.filter((record) => Boolean(record.active) === (active === 'true'))
  }
  return items
}

export async function listDriveLegalCollection(alias: string, query: URLSearchParams) {
  const name = canonicalName(alias)
  if (!isMongoReady()) return paginate(filterMemory(memoryList(name), query).map(toPublicRecord), query)

  const q = sanitizeText(query.get('q') || query.get('search') || '', 100)
  const filter: Record<string, unknown> = {}
  if (q) filter.$text = { $search: q }
  if (query.get('active') === 'true' || query.get('active') === 'false') filter.active = query.get('active') === 'true'

  const page = Math.max(Number(query.get('page') || 1), 1)
  const pageSize = Math.min(Math.max(Number(query.get('pageSize') || 10), 1), 50)
  const target = collection(name)!
  const [records, total] = await Promise.all([
    target.find(filter).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    target.countDocuments(filter),
  ])

  return {
    data: records.map(toPublicRecord),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  }
}

export async function getDriveLegalRecord(alias: string, id: string) {
  const name = canonicalName(alias)
  if (!looksLikeObjectId(id)) throw new ApiError(422, 'A valid 24 character ObjectId is required')
  if (!isMongoReady()) {
    const record = memoryList(name).find((item) => item._id === id)
    return record ? { data: toPublicRecord(record) } : null
  }
  const record = await collection(name)!.findOne({ _id: new ObjectId(id) })
  return record ? { data: toPublicRecord(record) } : null
}

export async function createDriveLegalRecord(alias: string, body: JsonRecord) {
  const name = canonicalName(alias)
  const now = new Date().toISOString()
  const record = { ...body, _id: body?._id || new ObjectId().toHexString(), createdAt: body?.createdAt || now, updatedAt: body?.updatedAt || now }
  if (!isMongoReady()) {
    memoryList(name).push(record)
    return { data: toPublicRecord(record) }
  }
  await collection(name)!.insertOne(mongoize(record) as Document)
  return { data: toPublicRecord(record) }
}

export async function updateDriveLegalRecord(alias: string, id: string, body: JsonRecord) {
  const name = canonicalName(alias)
  if (!looksLikeObjectId(id)) throw new ApiError(422, 'A valid 24 character ObjectId is required')
  const patch: JsonRecord = { ...body, updatedAt: body?.updatedAt || new Date().toISOString() }
  delete patch._id
  if (!isMongoReady()) {
    const records = memoryList(name)
    const index = records.findIndex((item) => item._id === id)
    if (index === -1) return null
    records[index] = { ...records[index], ...patch }
    return { data: toPublicRecord(records[index]) }
  }
  const result = await collection(name)!.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: mongoize(patch) as Document }, { returnDocument: 'after' })
  return result ? { data: toPublicRecord(result) } : null
}

export async function deleteDriveLegalRecord(alias: string, id: string) {
  const name = canonicalName(alias)
  if (!looksLikeObjectId(id)) throw new ApiError(422, 'A valid 24 character ObjectId is required')
  if (!isMongoReady()) {
    const records = memoryList(name)
    const index = records.findIndex((item) => item._id === id)
    if (index === -1) return null
    const [removed] = records.splice(index, 1)
    return { data: toPublicRecord(removed) }
  }
  const result = await collection(name)!.findOneAndDelete({ _id: new ObjectId(id) })
  return result ? { data: toPublicRecord(result) } : null
}

function pointInPolygon(lat: number, lng: number, polygon: { coordinates?: unknown[][][] } | undefined) {
  const ring = polygon?.coordinates?.[0]
  if (!Array.isArray(ring)) return false
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as number[]
    const [xj, yj] = ring[j] as number[]
    const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

export async function detectLocation(body: JsonRecord) {
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new ApiError(422, 'Valid latitude and longitude are required')

  const jurisdictions = isMongoReady()
    ? (await collection('jurisdictions')!.find({ active: true, geoBoundary: { $geoIntersects: { $geometry: { type: 'Point', coordinates: [lng, lat] } } } }).toArray()).map(toPublicRecord) as JsonRecord[]
    : memoryList('jurisdictions').filter((item) => item.active && pointInPolygon(lat, lng, item.geoBoundary as { coordinates?: unknown[][][] } | undefined)).map(toPublicRecord) as JsonRecord[]

  const city = jurisdictions.find((item) => item.type === 'city')
  const state = jurisdictions.find((item) => item.type === 'state')
  return {
    country: 'India',
    state: state?.name || city?.name || null,
    city: city?.name || null,
    jurisdictions,
  }
}

export async function lookupFine(body: JsonRecord) {
  const violationId = sanitizeText(body.violationId || '', 80)
  const violationCode = sanitizeText(body.violationCode || body.violation || '', 80).toUpperCase()
  const vehicleType = sanitizeText(body.vehicleType || body.vehicleTypeCode || '', 40)
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const location = Number.isFinite(lat) && Number.isFinite(lng) ? await detectLocation({ lat, lng }) : null
  const jurisdictionId = sanitizeText(body.jurisdictionId || location?.jurisdictions?.[0]?._id || '', 80)

  const fineRules = (isMongoReady() ? (await collection('fineRules')!.find({ active: true }).toArray()).map(toPublicRecord) : memoryList('fineRules').map(toPublicRecord)) as JsonRecord[]
  const vehicleTypes = (isMongoReady() ? (await collection('vehicleTypes')!.find({}).toArray()).map(toPublicRecord) : memoryList('vehicleTypes').map(toPublicRecord)) as JsonRecord[]
  const violations = (isMongoReady() ? (await collection('violations')!.find({}).toArray()).map(toPublicRecord) : memoryList('violations').map(toPublicRecord)) as JsonRecord[]
  const vehicle = vehicleTypes.find((item) => item.code === vehicleType || item._id === vehicleType) || null
  const violation = violations.find((item) => item._id === violationId || item.code === violationCode) || null
  const rule = fineRules.find((item) => {
    const matchesViolation = !violationId && !violationCode ? true : item.violationId === violationId || item.violationId === violation?._id
    const matchesJurisdiction = !jurisdictionId || item.jurisdictionId === jurisdictionId
    const matchesVehicle = !vehicle || item.vehicleTypeId === vehicle._id
    return matchesViolation && matchesJurisdiction && matchesVehicle
  })

  if (!rule) throw new ApiError(404, 'No fine rule found for the provided inputs')
  return {
    fine: rule.firstOffenceFine,
    repeatFine: rule.repeatOffenceFine,
    jurisdiction: jurisdictionId || null,
    vehicleType: vehicle?.code || null,
    violation: violation?.code || null,
    rule,
  }
}
