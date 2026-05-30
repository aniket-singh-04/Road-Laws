
import { db, publicUser } from '../data/store.js'
import { calculateCompliance } from './complianceService.js'

export function dashboard(user = db.users[0]) {
  const vehicles = db.vehicles.filter((vehicle) => user.vehicleIds.includes(vehicle.id))
  const compliance = vehicles.map((vehicle) => calculateCompliance({ vehicle }))
  const activeChallans = db.challans.filter((challan) => (
    vehicles.some((vehicle) => vehicle.plate === challan.vehiclePlate) && challan.status === 'pending'
  ))
  return {
    profile: publicUser(user),
    vehicles,
    savedLocations: user.savedLocations,
    complianceScore: Math.round(compliance.reduce((sum, item) => sum + item.score, 0) / Math.max(compliance.length, 1)),
    activeChallans,
    legalAlerts: db.notifications.slice(0, 5),
  }
}
