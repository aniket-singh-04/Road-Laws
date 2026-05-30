import type { Country, Dashboard, FineRule, Law, LegalDocument, Region, Violation, Zone } from '../types'

export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

type ApiList<T> = { data: T[] }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, options)
  if (!response.ok) throw new Error(`API ${response.status}: ${path}`)
  return response.json() as Promise<T>
}

export function loadCatalog(countryId: string) {
  return Promise.all([
    request<ApiList<Law>>(`/laws?pageSize=50&country=${countryId}`),
    request<ApiList<Violation>>(`/violations?pageSize=50&country=${countryId}`),
    request<ApiList<Zone>>('/zones?pageSize=50'),
    request<Dashboard>('/dashboard'),
    request<ApiList<Country>>('/countries'),
    request<ApiList<Region>>('/states'),
    request<ApiList<FineRule>>('/fines?pageSize=50'),
    request<ApiList<LegalDocument>>('/documents?pageSize=50'),
  ])
}

export function postTool(path: string, body: unknown, token = '') {
  return request<unknown>(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
}
