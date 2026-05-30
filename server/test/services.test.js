import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateChallan, calculateCompliance, decodeChallan, geoLookup, nearbyZones, routeCheck } from '../dist/services.js'
import { db } from '../dist/store.js'

test('challan decoder explains a known violation', () => {
  const result = decodeChallan({ challanNumber: 'CH-DL-2026-0001' })
  assert.equal(result.violation.id, 'NO_PARKING_DL')
  assert.equal(result.fineBreakdown.baseFine, 500)
})

test('compliance score penalizes expired documents and pending challans', () => {
  const result = calculateCompliance({ numberPlate: 'KA05CD9911' })
  assert.ok(result.score < 100)
  assert.ok(result.reasons.length >= 2)
})

test('nearby zones returns closest legal zones for a coordinate', () => {
  const result = nearbyZones(28.6328, 77.2197)
  assert.equal(result[0].stateId, 'dl')
})

test('route checker reports state transitions and required documents', () => {
  const result = routeCheck({ startStateId: 'dl', destinationStateId: 'ka' })
  assert.equal(result.route.stateTransitions.length, 2)
  assert.ok(result.requiredDocuments.includes('Insurance'))
})

test('challan calculator applies local fee and vehicle multiplier', () => {
  const result = calculateChallan({ countryId: 'in', stateId: 'dl', zoneType: 'parking', violationCode: 'NO_PARKING_DL', vehicleType: 'heavy' })
  assert.equal(result.fine.currency, 'INR')
  assert.equal(result.fine.payableAmount, 1000)
  assert.equal(result.compoundingAllowed, true)
})

test('geo lookup returns local fee schedules for a nearby zone', () => {
  const result = geoLookup({ lat: 28.6328, lng: 77.2197, violationCode: 'NO_PARKING_DL', vehicleType: 'car' })
  assert.equal(result.primaryZone.stateId, 'dl')
  assert.ok(result.applicableFees.length >= 1)
})

test('trafficRules.json is normalized into searchable law coverage', () => {
  assert.equal(db.rawTrafficRules.length, 280)
  assert.ok(db.states.some((state) => state.code === 'AP'))
  assert.ok(db.laws.some((law) => law.sourceRuleId === 'AP-TRF-2026-001'))
})
