export type Law = {
  id: string
  countryId: string
  title: string
  categoryId: string
  stateId: string
  tags: string[]
  section: string
  legalSource: string
  effectiveDate: string
  description: string
  penalties: string[]
}

export type Violation = {
  id: string
  countryId: string
  name: string
  section: string
  stateId: string
  baseFine: number
  repeatFine: number
  licenseConsequence: string
  enforcementNotes: string
}

export type Zone = {
  id: string
  countryId: string
  name: string
  type: string
  stateId: string
  center: { lat: number; lng: number }
  radiusMeters: number
  speedLimitKmph: number
  restrictions: string[]
  distanceMeters?: number
}

export type Country = {
  id: string
  name: string
  code: string
  currency: string
  nationalFramework: string
}

export type Region = {
  id: string
  countryId: string
  name: string
  code: string
}

export type Dashboard = {
  profile: { name: string; email: string; role: string }
  vehicles: Array<{ id: string; plate: string; type: string; documents: Array<{ type: string; expiresAt: string }> }>
  savedLocations: Array<{ id: string; label: string; stateId: string }>
  complianceScore: number
  activeChallans: Array<{ id: string; violationCode: string; status: string }>
  legalAlerts: Array<{ id: string; title: string; body: string }>
}

export type FineRule = {
  _id?: string
  id?: string
  violationId?: string
  jurisdictionId?: string
  vehicleTypeId?: string
  firstOffenceFine?: number
  repeatOffenceFine?: number
  amount?: number
  violationCode?: string
}

export type LegalDocument = {
  _id?: string
  id?: string
  title: string
  documentType?: string
  content?: string
  sourceUrl?: string
}

export type View = 'Dashboard' | 'Laws' | 'Violations' | 'Map' | 'Challan' | 'Route' | 'Compliance' | 'Settings'
