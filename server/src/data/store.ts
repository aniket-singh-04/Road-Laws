import { randomUUID } from 'node:crypto'
import { challans, countries, lawCategories, laws, legalZones, localFineSchedules, notifications, sampleVehicles, states, vehicleTypes, violations } from './data.js'
import { hashSecret } from '../utility/utils.js'
import { normalizeTrafficRules } from './trafficRules.js'

const trafficRules = normalizeTrafficRules()

type IdentifiedRecord = { id: string; [key: string]: unknown }
type Session = { accessToken: string; refreshToken?: string; [key: string]: unknown }
type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  role: string
  verified: boolean
  lockedUntil: string | null
  failedLogins: number
  savedLocations: Array<Record<string, unknown>>
  vehicleIds: string[]
  sessions: Session[]
  createdAt: string
  updatedAt: string
}

function mergeById<T extends IdentifiedRecord>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of secondary) map.set(item.id, item)
  for (const item of primary) map.set(item.id, item)
  return [...map.values()]
}

export const db = {
  users: [
    {
      id: 'user-demo',
      name: 'Aarav Sharma',
      email: 'driver@drivelegal.in',
      passwordHash: hashSecret('DriveLegal@123'),
      role: 'registered_user',
      verified: true,
      lockedUntil: null,
      failedLogins: 0,
      savedLocations: [
        { id: 'loc-1', label: 'Home', stateId: 'dl', lat: 28.6328, lng: 77.2197 },
        { id: 'loc-2', label: 'Office', stateId: 'ka', lat: 12.9784, lng: 77.6408 },
      ],
      vehicleIds: ['veh-1', 'veh-2'],
      sessions: [] as Session[],
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-05-01T09:00:00.000Z',
    },
    {
      id: 'admin-demo',
      name: 'State Admin',
      email: 'admin@drivelegal.in',
      passwordHash: hashSecret('DriveLegal@123'),
      role: 'super_admin',
      verified: true,
      lockedUntil: null,
      failedLogins: 0,
      savedLocations: [],
      vehicleIds: [],
      sessions: [] as Session[],
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-05-01T09:00:00.000Z',
    },
  ],
  countries: structuredClone(countries),
  roles: [
    { id: 'guest', permissions: ['laws:read', 'violations:read', 'zones:read'] },
    { id: 'registered_user', permissions: ['dashboard:read', 'vehicles:write', 'challans:read', 'notifications:read'] },
    { id: 'traffic_officer', permissions: ['laws:write', 'violations:write', 'notices:write'] },
    { id: 'state_admin', permissions: ['state:manage', 'zones:write', 'laws:write'] },
    { id: 'super_admin', permissions: ['*'] },
  ],
  states: mergeById(structuredClone(states), trafficRules.states),
  lawCategories: mergeById(structuredClone(lawCategories), trafficRules.categories),
  laws: [...structuredClone(laws), ...trafficRules.laws],
  rawTrafficRules: trafficRules.rawTrafficRules,
  violations: structuredClone(violations),
  legalZones: structuredClone(legalZones),
  vehicleTypes: structuredClone(vehicleTypes),
  localFineSchedules: structuredClone(localFineSchedules),
  vehicles: structuredClone(sampleVehicles),
  challans: structuredClone(challans),
  notifications: structuredClone(notifications),
  auditLogs: [] as Array<Record<string, unknown>>,
  resetTokens: [] as Array<Record<string, unknown>>,
  verificationTokens: [] as Array<Record<string, unknown>>,
}

export function audit(actorId: string, action: string, entity: string, metadata: Record<string, unknown> = {}) {
  db.auditLogs.unshift({
    id: randomUUID(),
    actorId,
    action,
    entity,
    metadata,
    createdAt: new Date().toISOString(),
  })
}

export function publicUser(user: User | null) {
  if (!user) return null
  const { passwordHash, sessions, failedLogins, lockedUntil, ...safe } = user
  return safe
}
