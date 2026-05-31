import { db } from '../data/store.js'
import { collection, isMongoReady, mongoStatus } from '../database/mongoClient.js'

import { filterBySearch, paginate } from '../utility/utils.js'
import type { Filter } from 'mongodb'

type LegalRecord = Record<string, unknown>

function stripMongoId(record: unknown): LegalRecord | unknown {
  if (!record || typeof record !== 'object') return record
  const { _id, ...rest } = record as LegalRecord
  return rest
}

async function findAll<T>(name: string, fallback: T[]): Promise<Array<T | unknown>> {
  if (!isMongoReady()) return fallback
  const records = await collection(name)!.find({}).toArray()
  return records.map(stripMongoId)
}

function paginateMemory<T>(items: T[], query: URLSearchParams) {
  return paginate(items, query)
}



async function paginateMongo(name: string, filter: Filter<Record<string, unknown>>, query: URLSearchParams, sort = {}) {
  const page = Math.max(Number(query.get('page') || 1), 1)
  const pageSize = Math.min(Math.max(Number(query.get('pageSize') || 10), 1), 50)
  const target = collection(name)
  const [records, total] = await Promise.all([
    target!.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    target!.countDocuments(filter),
  ])
  return {
    data: records.map(stripMongoId),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  }
}

function regex(value: string) {
  return { $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
}

export async function listCountries() {
  const raw = (await findAll('countries', db.countries)) as Array<Record<string, unknown>>
  const normalized = raw.map((c) => {
    // support legacy shapes: { countryCode, countryName } or { code, name }
    const code = String((c && (c.code || (c.countryCode as string))) || '')
    const id = String(((c && (c.id || code)) || '').toString())
    const name = String((c && (c.name || (c.countryName as string))) || '')
    return {
      id,
      name,
      code,
      currency: (c && (c.currency || (c.currencY as string) || '')) || '',
      nationalFramework: (c && (c.nationalFramework as string)) || (c && (c.framework as string)) || null,
      // include original record for any additional fields the frontend might need
      ...(c || {}),
    }
  })
  return { data: normalized }
}

export async function listStates() {
  return { data: await findAll('states', db.states) }
}

export async function listCategories() {
  return { data: await findAll('lawCategories', db.lawCategories) }
}

export async function searchTrafficRules(query: URLSearchParams) {
  if (!isMongoReady()) {
    let items = filterBySearch(db.rawTrafficRules, query.get('q'), ['ruleId', 'stateCode', 'stateName', 'ruleTitle', 'category', 'subCategory', 'severityLevel', 'approvalStatus'])
    const state = query.get('state')
    const status = query.get('approvalStatus')
    if (state) {
      const stateLower = String(state).toLowerCase()
      items = items.filter((rule) => String(rule.stateCode || '').toLowerCase() === stateLower || String(rule.stateName || '').toLowerCase() === stateLower)
    }
    if (status) {
      const statusLower = String(status).toLowerCase()
      items = items.filter((rule) => String(rule.approvalStatus || '').toLowerCase() === statusLower)
    }
    return paginateMemory(items, query)
  }

  const filter: Filter<Record<string, unknown>> = {}
  const q = query.get('q')
  const state = query.get('state')
  const status = query.get('approvalStatus')
  if (q) filter.$or = ['ruleId', 'stateCode', 'stateName', 'ruleTitle', 'category', 'subCategory', 'severityLevel', 'approvalStatus'].map((field) => ({ [field]: regex(q) }))
  if (state) filter.$or = [{ stateCode: regex(state) }, { stateName: regex(state) }]
  if (status) filter.approvalStatus = regex(status)
  return paginateMongo('rawTrafficRules', filter, query, { stateCode: 1, ruleId: 1 })
}

export async function searchLaws(query: URLSearchParams) {
  if (!isMongoReady()) {
    let items = filterBySearch(db.laws, query.get('q'), ['title', 'description', 'section', 'legalSource'])
    const state = query.get('state')
    const country = query.get('country')
    const category = query.get('category')
    if (country) items = items.filter((law) => law.countryId === country)
    if (state) items = items.filter((law) => law.stateId === state || law.stateId === 'all')
    if (category) items = items.filter((law) => law.categoryId === category)
    return paginateMemory(items, query)
  }

  const filter: Filter<Record<string, unknown>> = {}
  const q = query.get('q')
  const state = query.get('state')
  const country = query.get('country')
  const category = query.get('category')
  if (q) filter.$or = ['title', 'description', 'section', 'legalSource'].map((field) => ({ [field]: regex(q) }))
  if (country) filter.countryId = country
  if (state) filter.stateId = { $in: [state, 'all'] }
  if (category) filter.categoryId = category
  return paginateMongo('laws', filter, query, { title: 1 })
}

export async function getLaw(id: string) {
  const law = isMongoReady()
    ? stripMongoId(await collection('laws')!.findOne({ id }))
    : db.laws.find((item) => item.id === id)
  if (!law) return null
  const relatedLawIds = Array.isArray((law as LegalRecord).relatedLawIds) ? (law as { relatedLawIds: string[] }).relatedLawIds : []
  const relatedLaws = db.laws.filter((item) => relatedLawIds.includes(item.id))
  return { data: { ...law, relatedLaws } }
}

export async function searchViolations(query: URLSearchParams) {
  if (!isMongoReady()) {
    let items = filterBySearch(db.violations, query.get('q'), ['id', 'name', 'section', 'enforcementNotes'])
    const state = query.get('state')
    const country = query.get('country')
    if (country) items = items.filter((violation) => violation.countryId === country)
    if (state) items = items.filter((violation) => violation.stateId === state || violation.stateId === 'all')
    return paginateMemory(items, query)
  }

  const filter: Filter<Record<string, unknown>> = {}
  const q = query.get('q')
  const state = query.get('state')
  const country = query.get('country')
  if (q) filter.$or = ['id', 'name', 'section', 'enforcementNotes'].map((field) => ({ [field]: regex(q) }))
  if (country) filter.countryId = country
  if (state) filter.stateId = { $in: [state, 'all'] }
  return paginateMongo('violations', filter, query, { name: 1 })
}

export async function getViolation(id: string) {
  const violation = isMongoReady()
    ? stripMongoId(await collection('violations')!.findOne({ id }))
    : db.violations.find((item) => item.id === id)
  return violation ? { data: violation } : null
}

export async function listZones(query: URLSearchParams) {
  if (!isMongoReady()) return paginateMemory(db.legalZones, query)
  return paginateMongo('legalZones', {}, query, { name: 1 })
}

export async function listNotifications() {
  return { data: await findAll('notifications', db.notifications) }
}

export function databaseStatus() {
  return mongoStatus()
}
