import { useEffect, useMemo, useState } from 'react'
import { fallbackCountries, fallbackDashboard, fallbackFineRules, fallbackLaws, fallbackLegalDocuments, fallbackRegions, fallbackViolations, fallbackZones } from '../data/fallbacks'
import { loadCatalog } from '../lib/api'
import type { Country, Dashboard, FineRule, Law, LegalDocument, Region, Violation, Zone } from '../types'

const cacheKey = 'drivelegal.offline.v3'

type CachedCatalog = {
  countries?: Country[]
  regions?: Region[]
  laws?: Law[]
  violations?: Violation[]
  zones?: Zone[]
  fineRules?: FineRule[]
  legalDocuments?: LegalDocument[]
}

export function useDriveLegalData(countryFilter: string, stateFilter: string, query: string) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [serverOnline, setServerOnline] = useState(false)
  const [countries, setCountries] = useState<Country[]>(fallbackCountries)
  const [regions, setRegions] = useState<Region[]>(fallbackRegions)
  const [laws, setLaws] = useState<Law[]>(fallbackLaws)
  const [violations, setViolations] = useState<Violation[]>(fallbackViolations)
  const [zones, setZones] = useState<Zone[]>(fallbackZones)
  const [fineRules, setFineRules] = useState<FineRule[]>(fallbackFineRules)
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>(fallbackLegalDocuments)
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached) as CachedCatalog
        const normalizeCountry = (c: any) => ({
          id: c.id || c.countryCode || c.code || '',
          name: c.name || c.countryName || '',
          code: c.code || c.countryCode || '',
          currency: c.currency || '',
          nationalFramework: c.nationalFramework || c.framework || null,
          ...c,
        })
        setCountries((parsed.countries || fallbackCountries).map(normalizeCountry))
        setRegions(parsed.regions || fallbackRegions)
        setLaws(parsed.laws || fallbackLaws)
        setViolations(parsed.violations || fallbackViolations)
        setZones(parsed.zones || fallbackZones)
        setFineRules(parsed.fineRules || fallbackFineRules)
        setLegalDocuments(parsed.legalDocuments || fallbackLegalDocuments)
      }

      try {
        const [lawData, violationData, zoneData, dashData, countryData, regionData, fineData, documentData] = await loadCatalog(countryFilter)
        if (!active) return
        setToken('')
        setCountries((countryData.data || fallbackCountries).map((c: any) => ({
          id: c.id || c.countryCode || c.code || '',
          name: c.name || c.countryName || '',
          code: c.code || c.countryCode || '',
          currency: c.currency || '',
          ...c,
        })))
        setRegions(regionData.data || fallbackRegions)
        setLaws(lawData.data || fallbackLaws)
        setViolations(violationData.data || fallbackViolations)
        setZones(zoneData.data || fallbackZones)
        setFineRules(fineData.data || fallbackFineRules)
        setLegalDocuments(documentData.data || fallbackLegalDocuments)
        setDashboard(dashData.profile ? dashData : fallbackDashboard)
        localStorage.setItem(cacheKey, JSON.stringify({
          countries: (countryData.data || fallbackCountries).map((c: any) => ({
            id: c.id || c.countryCode || c.code || '',
            name: c.name || c.countryName || '',
            code: c.code || c.countryCode || '',
            currency: c.currency || '',
            ...c,
          })),
          regions: regionData.data || fallbackRegions,
          laws: lawData.data || fallbackLaws,
          violations: violationData.data || fallbackViolations,
          zones: zoneData.data || fallbackZones,
          fineRules: fineData.data || fallbackFineRules,
          legalDocuments: documentData.data || fallbackLegalDocuments,
        }))
        setServerOnline(true)
      } catch {
        if (active) setServerOnline(false)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [countryFilter])

  const filteredLaws = useMemo(() => {
    const needle = query.toLowerCase()
    return laws.filter((law) => {
      const matchesState = stateFilter === 'all' || law.stateId === 'all' || law.stateId === stateFilter
      const matchesCountry = law.countryId === countryFilter
      const haystack = [law.title, law.description, law.section, law.tags.join(' ')].join(' ').toLowerCase()
      return matchesCountry && matchesState && haystack.includes(needle)
    })
  }, [laws, query, stateFilter, countryFilter])

  const filteredViolations = useMemo(() => {
    const needle = query.toLowerCase()
    return violations.filter((violation) => (
      violation.countryId === countryFilter &&
      [violation.id, violation.name, violation.section].join(' ').toLowerCase().includes(needle)
    ))
  }, [violations, query, countryFilter])

  return {
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
  }
}
