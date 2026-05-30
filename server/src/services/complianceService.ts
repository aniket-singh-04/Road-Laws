
import { db } from '../data/store.js'
import { ApiError, daysUntil } from '../utility/utils.js'

type ComplianceInput = {
  vehicleId?: string
  numberPlate?: string
  vehiclePlate?: string
  vehicle?: (typeof db.vehicles)[number]
}

export function calculateCompliance(input: ComplianceInput) {
  const vehicle = input.numberPlate
    ? db.vehicles.find((item) => item.plate === input.numberPlate)
    : input.vehicleId
    ? db.vehicles.find((item) => item.id === input.vehicleId)
    : db.vehicles.find((item) => item.plate === input.vehiclePlate) || input.vehicle
  if (!vehicle) throw new ApiError(404, 'Vehicle was not found')

  const pendingChallans = db.challans.filter((challan) => challan.vehiclePlate === vehicle.plate && challan.status === 'pending')
  const reasons: string[] = []
  let score = 100

  for (const doc of vehicle.documents || []) {
    const remaining = daysUntil(doc.expiresAt)
    if (remaining < 0) {
      score -= doc.type === 'insurance' ? 25 : 15
      reasons.push(`${doc.type.toUpperCase()} expired ${Math.abs(remaining)} days ago`)
    } else if (remaining <= 30) {
      score -= 5
      reasons.push(`${doc.type.toUpperCase()} expires in ${remaining} days`)
    }
  }

  if (pendingChallans.length) {
    score -= Math.min(30, pendingChallans.length * 10)
    reasons.push(`${pendingChallans.length} pending challan${pendingChallans.length > 1 ? 's' : ''}`)
  }

  return {
    vehicle,
    score: Math.max(score, 0),
    grade: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Needs attention' : 'High risk',
    reasons,
    recommendations: reasons.length
      ? ['Resolve pending challans', 'Renew expiring documents', 'Keep digital copies available']
      : ['No immediate compliance action required'],
  }
}
