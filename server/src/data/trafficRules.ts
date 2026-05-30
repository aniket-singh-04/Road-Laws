import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type RawTrafficRule = {
  ruleId: string
  stateCode: string
  stateName: string
  ruleTitle: string
  category: string
  subCategory: string
  severityLevel: string
  approvalStatus: string
  ruleStatus: string
  legalReference: {
    actName: string
    sectionNumber: string
  }
}

const stateIdByCode: Record<string, string> = {
  AP: 'ap',
  AR: 'ar',
  AS: 'as',
  BR: 'br',
  CG: 'cg',
  GA: 'ga',
  GJ: 'gj',
  HP: 'hp',
  HR: 'hr',
  JH: 'jh',
  KA: 'ka',
  KL: 'kl',
  MH: 'mh',
  ML: 'ml',
  MN: 'mn',
  MP: 'mp',
  MZ: 'mz',
  NL: 'nl',
  OD: 'od',
  PB: 'pb',
  RJ: 'rj',
  SK: 'sk',
  TG: 'tg',
  TN: 'tn',
  TR: 'tr',
  UK: 'uk-in',
  UP: 'up',
  WB: 'wb',
}

const categoryIdByName: Record<string, string> = {
  Alcohol: 'alcohol',
  'Distracted Driving': 'distracted-driving',
  Documentation: 'documents',
  Enforcement: 'enforcement',
  Parking: 'parking',
  Safety: 'driving',
  Speed: 'speed',
  'Traffic Control': 'traffic-control',
}

const descriptionsBySubCategory: Record<string, string> = {
  Helmet: 'Riders must follow the applicable helmet requirement and carry approved protective headgear where required.',
  'Seat Belt': 'Drivers and passengers must use seat belts as required by the applicable traffic law.',
  'Mobile Usage': 'Drivers must not use a handheld mobile phone or otherwise drive while distracted.',
  Overspeeding: 'Drivers must comply with posted and notified speed limits for the road, vehicle, and zone.',
  'Driving Licence': 'Drivers must hold and produce a valid driving licence for the vehicle class being driven.',
  'Drunk Driving': 'Driving under the influence of alcohol or intoxicants is prohibited and can trigger serious penalties.',
  Insurance: 'Vehicles used on public roads must carry valid insurance documents.',
  'Parking Regulation': 'Vehicles must comply with state and local no-parking, tow-away, and stopping restrictions.',
  'Camera Monitoring': 'Automated camera enforcement zones may record violations for challan generation.',
  'Restricted Entry': 'Local authorities may restrict entry by vehicle class, time window, or notified area.',
}

function projectRootTrafficRulesPath() {
  const here = dirname(fileURLToPath(import.meta.url))
  return resolve(here, '../../../trafficRules.json')
}

export function loadTrafficRules(filePath = projectRootTrafficRulesPath()): RawTrafficRule[] {
  if (!existsSync(filePath)) return []
  const parsed = JSON.parse(readFileSync(filePath, 'utf8'))
  if (!Array.isArray(parsed)) return []
  return parsed.filter((rule): rule is RawTrafficRule => Boolean(rule?.ruleId && rule?.stateCode && rule?.ruleTitle))
}

export function trafficRulesToStates(rules: RawTrafficRule[]) {
  const byCode = new Map<string, { id: string; countryId: string; name: string; code: string; capital: string }>()
  for (const rule of rules) {
    const id = stateIdByCode[rule.stateCode] || rule.stateCode.toLowerCase()
    byCode.set(rule.stateCode, {
      id,
      countryId: 'in',
      name: rule.stateName,
      code: rule.stateCode,
      capital: '',
    })
  }
  return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function trafficRulesToCategories(rules: RawTrafficRule[]) {
  const byName = new Map<string, { id: string; name: string }>()
  for (const rule of rules) {
    const id = categoryIdByName[rule.category] || rule.category.toLowerCase().replaceAll(' ', '-')
    byName.set(id, { id, name: rule.category })
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function trafficRulesToLaws(rules: RawTrafficRule[]) {
  return rules.map((rule) => {
    const section = `${rule.legalReference.actName} - Section ${rule.legalReference.sectionNumber}`
    const stateId = stateIdByCode[rule.stateCode] || rule.stateCode.toLowerCase()
    return {
      id: rule.ruleId.toLowerCase(),
      sourceRuleId: rule.ruleId,
      countryId: 'in',
      title: rule.ruleTitle,
      categoryId: categoryIdByName[rule.category] || rule.category.toLowerCase().replaceAll(' ', '-'),
      stateId,
      stateCode: rule.stateCode,
      tags: [rule.category, rule.subCategory, rule.severityLevel, rule.approvalStatus].map((tag) => tag.toLowerCase().replaceAll(' ', '-')),
      section,
      legalSource: rule.legalReference.actName,
      effectiveDate: '2026-01-01',
      description: descriptionsBySubCategory[rule.subCategory] || `${rule.ruleTitle} applies under ${section}.`,
      penalties: rule.approvalStatus === 'Approved'
        ? ['Fine or challan may apply as per notified state compounding schedule']
        : ['Pending verification: confirm the latest local notification before enforcement action'],
      relatedLawIds: [],
      severityLevel: rule.severityLevel,
      ruleStatus: rule.ruleStatus,
      approvalStatus: rule.approvalStatus,
    }
  })
}

export function normalizeTrafficRules() {
  const rules = loadTrafficRules()
  return {
    rawTrafficRules: rules,
    states: trafficRulesToStates(rules),
    categories: trafficRulesToCategories(rules),
    laws: trafficRulesToLaws(rules),
  }
}
