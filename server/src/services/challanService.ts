
import { db } from '../data/store.js'
import { ApiError, sanitizeText } from '../utility/utils.js'

type ChallanBody = Record<string, unknown>

export function decodeChallan(body: ChallanBody) {
  const challanNumber = sanitizeText(body.challanNumber || body.id, 80)
  const violationCode = sanitizeText(body.violationCode, 80)
  const challan = db.challans.find((item) => item.id.toLowerCase() === challanNumber.toLowerCase())
  const violation = db.violations.find((item) => item.id === (challan?.violationCode || violationCode))
  if (!violation) throw new ApiError(404, 'Violation code was not found')
  return {
    challan: challan || null,
    violation,
    fineBreakdown: {
      baseFine: violation.baseFine,
      repeatOffenseFine: violation.repeatFine,
      estimatedTotal: violation.baseFine,
    },
    applicableLaw: db.laws.find((law) => violation.section.includes(law.section.split(' - ')[0])) || null,
    paymentInstructions: violation.paymentInstructions,
    appealInstructions: violation.appealInstructions,
  }
}

export function calculateChallan(body: ChallanBody) {
  const requestedViolation = sanitizeText(body.violationCode || body.violation || '', 80).toUpperCase()
  const violationAliases: Record<string, string> = { SPEEDING: 'OVER_SPEEDING', OVERSPEEDING: 'OVER_SPEEDING', HELMET: 'NO_HELMET', PARKING: 'NO_PARKING_DL' }
  const violationCode = violationAliases[requestedViolation] || requestedViolation
  const requestedVehicleType = sanitizeText(body.vehicleType || 'car', 40)
  const vehicleTypeMap: Record<string, string> = { '2W': 'two-wheeler', CAR: 'car', AUTO: 'commercial', BUS: 'commercial', TRUCK: 'heavy', HMV: 'heavy', LMV: 'car' }
  const vehicleType = vehicleTypeMap[requestedVehicleType.toUpperCase()] || requestedVehicleType
  const countryId = sanitizeText(body.countryId || 'in', 20)
  const stateId = sanitizeText(body.stateId || body.state || 'all', 30).toLowerCase()
  const repeat = Boolean(body.repeatOffense)
  const zoneType = sanitizeText(body.zoneType || '', 40)
  const violation = db.violations.find((item) => item.id === violationCode && item.countryId === countryId)
  if (!violation) throw new ApiError(404, 'Violation code was not found for that country')

  const vehicle = db.vehicleTypes.find((item) => item.id === vehicleType) || db.vehicleTypes[0]
  const localFee = db.localFineSchedules.find((fee) => {
    const matchesState = fee.stateId === stateId || fee.stateId === 'all'
    const matchesZone = !zoneType || fee.zoneType === zoneType
    return fee.countryId === countryId && fee.violationCode === violationCode && matchesState && matchesZone
  })

  let baseAmount = localFee?.amount || (repeat ? violation.repeatFine : violation.baseFine)
  const speed = Number(body.speed)
  const speedLimit = Number(body.speedLimit)
  if (violationCode === 'OVER_SPEEDING' && Number.isFinite(speed) && Number.isFinite(speedLimit)) {
    const excess = Math.max(speed - speedLimit, 0)
    if (excess > 40) baseAmount = Math.max(baseAmount, 5000)
    else if (excess > 20) baseAmount = Math.max(baseAmount, 2000)
    else if (excess > 0) baseAmount = Math.max(baseAmount, 1000)
  }
  const country = db.countries.find((item) => item.id === countryId)
  return {
    country,
    state: db.states.find((item) => item.id === stateId) || null,
    violation,
    vehicleType: vehicle,
    localFineSchedule: localFee || null,
    repeatOffense: repeat,
    compoundingAllowed: localFee?.compoundingAllowed ?? true,
    fine: {
      currency: country?.currency || 'INR',
      baseAmount,
      vehicleMultiplier: vehicle.multiplier,
      payableAmount: Math.round(baseAmount * vehicle.multiplier),
    },
    explanation: `${violation.name}: ${violation.enforcementNotes}`,
    sourceTrail: [violation.section, country?.nationalFramework, localFee ? `Local schedule ${localFee.id}` : 'National/default schedule'].filter(Boolean),
  }
}
