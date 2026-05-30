import { db } from '../data/store.js'
import { ApiError, distanceMeters, sanitizeText } from '../utility/utils.js'
import { calculateChallan } from './challanService.js'

type GeoLookupBody = {
  lat?: unknown
  lng?: unknown
  violationCode?: unknown
  vehicleType?: unknown
}

export function nearbyZones(lat: unknown, lng: unknown) {
  const point = { lat: Number(lat), lng: Number(lng) }
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) throw new ApiError(422, 'Valid latitude and longitude are required')
  return db.legalZones
    .map((zone) => ({ ...zone, distanceMeters: Math.round(distanceMeters(point, zone.center)) }))
    .filter((zone) => zone.distanceMeters <= zone.radiusMeters + 5000)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
}

export function geoLookup(body: GeoLookupBody) {
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const violationCode = sanitizeText(body.violationCode || '', 80)
  const vehicleType = sanitizeText(body.vehicleType || 'car', 40)
  const zones = nearbyZones(lat, lng)
  const primaryZone = zones[0] || null
  if (!primaryZone) return { zones: [], applicableFees: [], message: 'No configured legal zone found near this coordinate.' }

  const fees = db.localFineSchedules.filter((fee) => {
    const matchesViolation = !violationCode || fee.violationCode === violationCode
    const matchesState = fee.stateId === primaryZone.stateId || fee.stateId === 'all'
    return fee.countryId === primaryZone.countryId && fee.zoneType === primaryZone.type && matchesViolation && matchesState
  })

  return {
    primaryZone,
    zones,
    applicableFees: fees.map((fee) => calculateChallan({
      countryId: fee.countryId,
      stateId: primaryZone.stateId,
      zoneType: primaryZone.type,
      violationCode: fee.violationCode,
      vehicleType,
    })),
  }
}
