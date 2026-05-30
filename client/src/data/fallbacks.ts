import type { Country, Dashboard, FineRule, Law, LegalDocument, Region, Violation, Zone } from '../types'

export const fallbackLaws: Law[] = [
  {
    id: 'mv-146',
    countryId: 'in',
    title: 'Mandatory valid insurance',
    categoryId: 'documents',
    stateId: 'all',
    tags: ['insurance', 'documents'],
    section: 'Motor Vehicles Act Section 146',
    legalSource: 'Motor Vehicles Act, 1988',
    effectiveDate: '2019-09-01',
    description: 'Every vehicle used in a public place must carry active third-party insurance.',
    penalties: ['First offence fine up to INR 2,000', 'Repeat offence fine up to INR 4,000'],
  },
  {
    id: 'mv-194d',
    countryId: 'in',
    title: 'Helmet and protective headgear requirement',
    categoryId: 'driving',
    stateId: 'all',
    tags: ['helmet', 'two-wheeler'],
    section: 'Motor Vehicles Act Section 194D',
    legalSource: 'Motor Vehicles Act, 1988',
    effectiveDate: '2019-09-01',
    description: 'Two-wheeler riders and pillion riders must wear protective headgear unless exempted.',
    penalties: ['INR 1,000 fine', 'Licence disqualification may apply'],
  },
]

export const fallbackViolations: Violation[] = [
  {
    id: 'NO_INSURANCE',
    countryId: 'in',
    name: 'Driving without valid insurance',
    section: 'MV Act Section 146/196',
    stateId: 'all',
    baseFine: 2000,
    repeatFine: 4000,
    licenseConsequence: 'Repeat cases may involve court action.',
    enforcementNotes: 'Digital policy copy is usually accepted when verifiable.',
  },
  {
    id: 'OVER_SPEEDING',
    countryId: 'in',
    name: 'Overspeeding',
    section: 'MV Act Section 183',
    stateId: 'all',
    baseFine: 2000,
    repeatFine: 4000,
    licenseConsequence: 'Repeated overspeeding can trigger licence action.',
    enforcementNotes: 'Fine varies by vehicle class and notified speed limit.',
  },
]

export const fallbackZones: Zone[] = [
  {
    id: 'zone-delhi-school-connaught',
    countryId: 'in',
    name: 'Connaught Place School Safety Ring',
    type: 'school',
    stateId: 'dl',
    center: { lat: 28.6328, lng: 77.2197 },
    radiusMeters: 900,
    speedLimitKmph: 25,
    restrictions: ['No honking near schools', 'No obstructive parking', 'Pedestrian priority'],
  },
  {
    id: 'zone-bengaluru-school-indiranagar',
    countryId: 'in',
    name: 'Indiranagar School Zone',
    type: 'school',
    stateId: 'ka',
    center: { lat: 12.9784, lng: 77.6408 },
    radiusMeters: 700,
    speedLimitKmph: 25,
    restrictions: ['School-hour speed limit', 'No stopping at gates', 'Helmet enforcement priority'],
  },
]

export const fallbackCountries: Country[] = [
  { id: 'in', name: 'India', code: 'IN', currency: 'INR', nationalFramework: 'Motor Vehicles Act, 1988 and Central Motor Vehicles Rules' },
  { id: 'uk', name: 'United Kingdom', code: 'GB', currency: 'GBP', nationalFramework: 'Road Traffic Act 1988 and Highway Code' },
  { id: 'us', name: 'United States', code: 'US', currency: 'USD', nationalFramework: 'State traffic codes with federal safety standards' },
]

export const fallbackRegions: Region[] = [
  { id: 'dl', countryId: 'in', name: 'Delhi', code: 'DL' },
  { id: 'ka', countryId: 'in', name: 'Karnataka', code: 'KA' },
  { id: 'mh', countryId: 'in', name: 'Maharashtra', code: 'MH' },
]

export const fallbackDashboard: Dashboard = {
  profile: { name: 'Aarav Sharma', email: 'driver@drivelegal.in', role: 'registered_user' },
  vehicles: [
    {
      id: 'veh-1',
      plate: 'DL01AB1234',
      type: 'car',
      documents: [
        { type: 'insurance', expiresAt: '2026-08-15' },
        { type: 'puc', expiresAt: '2026-06-20' },
        { type: 'registration', expiresAt: '2031-01-04' },
      ],
    },
  ],
  savedLocations: [{ id: 'loc-1', label: 'Home', stateId: 'dl' }],
  complianceScore: 88,
  activeChallans: [{ id: 'CH-DL-2026-0001', violationCode: 'NO_PARKING_DL', status: 'pending' }],
  legalAlerts: [{ id: 'n-1', title: 'Delhi parking corridors updated', body: 'New tow-away corridors were added.' }],
}

export const fallbackFineRules: FineRule[] = [
  { id: 'fee-dl-no-parking', violationCode: 'NO_PARKING_DL', amount: 500 },
  { id: 'fee-in-speed-school', violationCode: 'OVER_SPEEDING', amount: 2000 },
]

export const fallbackLegalDocuments: LegalDocument[] = [
  {
    id: 'doc-mv-helmet',
    title: 'Helmet and protective headgear enforcement note',
    documentType: 'act_extract',
    content: 'Two-wheeler riders and pillion riders must wear protective headgear unless exempted.',
  },
]
