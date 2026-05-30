
import { db } from '../data/store.js'
import { sanitizeText } from '../utility/utils.js'

export function routeCheck(body: Record<string, unknown>) {
  const startStateId = sanitizeText(body.startStateId || 'dl', 20)
  const destinationStateId = sanitizeText(body.destinationStateId || 'ka', 20)
  const crossedStates = [startStateId, destinationStateId].filter((value, index, values) => values.indexOf(value) === index)
  const restrictions = db.legalZones.filter((zone) => crossedStates.includes(zone.stateId))
  return {
    route: {
      start: sanitizeText(body.start || 'Start', 120),
      destination: sanitizeText(body.destination || 'Destination', 120),
      stateTransitions: crossedStates.map((id) => db.states.find((state) => state.id === id)).filter(Boolean),
    },
    restrictions,
    speedZones: restrictions.filter((zone) => zone.speedLimitKmph).map((zone) => ({
      zoneId: zone.id,
      name: zone.name,
      speedLimitKmph: zone.speedLimitKmph,
    })),
    tollInformation: crossedStates.length > 1 ? 'Inter-state tolls and FASTag balance checks may apply.' : 'No inter-state toll transition detected.',
    requiredDocuments: ['Driving licence', 'Registration certificate', 'Insurance', 'PUC certificate'],
  }
}
