import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { ActionPanel } from './components/ActionPanel'
import { AppShell } from './components/AppShell'
import { Skeleton } from './components/Skeleton'
import { DashboardView } from './features/DashboardView'
import { LawExplorer } from './features/LawExplorer'
import { MapExplorer } from './features/MapExplorer'
import { SettingsView } from './features/SettingsView'
import { ViolationExplorer } from './features/ViolationExplorer'
import { useDriveLegalData } from './hooks/useDriveLegalData'
import { postTool } from './lib/api'
import type { View } from './types'

const views: View[] = ['Dashboard', 'Laws', 'Violations', 'Map', 'Challan', 'Route', 'Compliance', 'Settings']

function App() {
  const [view, setView] = useState<View>('Dashboard')
  const [dark, setDark] = useState(false)
  const [query, setQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('in')
  const [stateFilter, setStateFilter] = useState('all')
  const [challanResult, setChallanResult] = useState('Enter a violation code, vehicle type, and location to calculate a challan.')
  const [routeResult, setRouteResult] = useState('Choose a route to inspect state transitions and legal restrictions.')
  const [complianceResult, setComplianceResult] = useState('Select a saved vehicle to calculate a rule-based score.')

  const {
    token,
    loading,
    serverOnline,
    countries,
    regions,
    zones,
    fineRules,
    legalDocuments,
    dashboard,
    filteredLaws,
    filteredViolations,
  } = useDriveLegalData(countryFilter, stateFilter, query)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  const selectedCountry = countries.find((country) => country.id === countryFilter) || countries[0]
  const availableRegions = useMemo(
    () => regions.filter((region) => region.countryId === countryFilter),
    [regions, countryFilter],
  )
  const regionOptions = useMemo(
    () => [{ value: 'all', label: 'All regions' }, ...availableRegions.map((region) => ({ value: region.id, label: region.name, description: region.code }))],
    [availableRegions],
  )
  const violationOptions = useMemo(
    () => filteredViolations.map((violation) => ({ value: violation.id, label: violation.name, description: violation.section })),
    [filteredViolations],
  )
  const vehicleOptions = [
    { value: 'car', label: 'Private car' },
    { value: 'two-wheeler', label: 'Two-wheeler' },
    { value: 'commercial', label: 'Commercial vehicle' },
    { value: 'heavy', label: 'Heavy vehicle' },
  ]
  const zoneOptions = [
    { value: 'school', label: 'School zone' },
    { value: 'parking', label: 'Parking zone' },
    { value: 'emission', label: 'Emission zone' },
  ]
  const countryOptions = countries.map((country) => ({ value: country.id, label: country.name, description: country.currency }))

  async function runTool(path: string, body: unknown, setter: (value: string) => void) {
    try {
      const result = await postTool(path, body, token)
      setter(JSON.stringify(result, null, 2))
    } catch {
      setter('The local API is offline. Start the server with npm run dev in the server folder.')
    }
  }

  return (
    <AppShell
      view={view}
      views={views}
      dark={dark}
      query={query}
      countryFilter={countryFilter}
      countries={countries}
      serverOnline={serverOnline}
      onViewChange={setView}
      onDarkToggle={() => setDark((value) => !value)}
      onQueryChange={setQuery}
      onCountryChange={setCountryFilter}
    >
      {loading ? <Skeleton /> : null}
      {!loading && view === 'Dashboard' ? (
        <DashboardView
          data={dashboard}
          country={selectedCountry}
          laws={filteredLaws}
          violations={filteredViolations}
          zones={zones}
          fineRules={fineRules}
          legalDocuments={legalDocuments}
        />
      ) : null}
      {!loading && view === 'Laws' ? (
        <LawExplorer laws={filteredLaws} regions={availableRegions} stateFilter={stateFilter} onStateChange={setStateFilter} />
      ) : null}
      {!loading && view === 'Violations' ? <ViolationExplorer violations={filteredViolations} /> : null}
      {!loading && view === 'Map' ? <MapExplorer zones={zones} /> : null}
      {!loading && view === 'Challan' ? (
        <ActionPanel
          title="Challan calculator"
          fields={[
            { name: 'countryId', label: 'Country', options: countryOptions },
            { name: 'stateId', label: 'Region', options: regionOptions.filter((option) => option.value !== 'all') },
            { name: 'zoneType', label: 'Zone type', options: zoneOptions },
            { name: 'violationCode', label: 'Violation', options: violationOptions },
            { name: 'vehicleType', label: 'Vehicle type', options: vehicleOptions },
            { name: 'repeatOffense', label: 'Repeat offence', options: [{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }] },
          ]}
          initial={{
            countryId: countryFilter,
            stateId: stateFilter === 'all' ? 'dl' : stateFilter,
            zoneType: 'school',
            violationCode: violationOptions[0]?.value || 'OVER_SPEEDING',
            vehicleType: 'car',
            repeatOffense: 'false',
          }}
          onRun={(body) => runTool('/challans/calculate', { ...body, repeatOffense: body.repeatOffense === 'true' }, setChallanResult)}
          output={challanResult}
        />
      ) : null}
      {!loading && view === 'Route' ? (
        <ActionPanel
          title="Travel route legal checker"
          fields={[
            'start',
            'destination',
            { name: 'startStateId', label: 'Start region', options: regionOptions.filter((option) => option.value !== 'all') },
            { name: 'destinationStateId', label: 'Destination region', options: regionOptions.filter((option) => option.value !== 'all') },
          ]}
          initial={{ start: 'Delhi', destination: 'Bengaluru', startStateId: 'dl', destinationStateId: 'ka' }}
          onRun={(body) => runTool('/routes/check', body, setRouteResult)}
          output={routeResult}
        />
      ) : null}
      {!loading && view === 'Compliance' ? (
        <ActionPanel
          title="Compliance score engine"
          fields={[{ name: 'numberPlate', label: 'Vehicle Plate' }]}
          initial={{ numberPlate: 'DL01AB1234' }}
          onRun={(body) => runTool('/compliance/score', body, setComplianceResult)}
          output={complianceResult}
        />
      ) : null}
      {!loading && view === 'Settings' ? <SettingsView serverOnline={serverOnline} /> : null}
    </AppShell>
  )
}

export default App
