import type { ReactNode } from 'react'
import { FiActivity, FiBookOpen, FiCheckSquare, FiClipboard, FiMap, FiMenu, FiMoon, FiSearch, FiSettings, FiShield, FiSun } from 'react-icons/fi'
import { SelectListbox } from './SelectListbox'
import type { Country, View } from '../types'

type Props = {
  view: View
  views: View[]
  dark: boolean
  query: string
  countryFilter: string
  countries: Country[]
  serverOnline: boolean
  onViewChange: (view: View) => void
  onDarkToggle: () => void
  onQueryChange: (value: string) => void
  onCountryChange: (value: string) => void
  children: ReactNode
}

const viewIcons: Record<View, ReactNode> = {
  Dashboard: <FiActivity />,
  Laws: <FiBookOpen />,
  Violations: <FiShield />,
  Map: <FiMap />,
  Challan: <FiClipboard />,
  Route: <FiMenu />,
  Compliance: <FiCheckSquare />,
  Settings: <FiSettings />,
}

export function AppShell({
  view,
  views,
  dark,
  query,
  countryFilter,
  countries,
  serverOnline,
  onViewChange,
  onDarkToggle,
  onQueryChange,
  onCountryChange,
  children,
}: Props) {
  const countryOptions = countries.map((country) => ({
    value: country.id,
    label: country.name,
    description: `${country.code} - ${country.currency}`,
  }))
  const viewOptions = views.map((item) => ({ value: item, label: item }))

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">DL</span>
          <div className='logo'>
            <strong>DriveLegal</strong>
            <small>Global traffic law intelligence</small>
          </div>
        </div>
        <nav>
          {views.map((item) => (
            <button key={item} className={view === item ? 'active' : ''} onClick={() => onViewChange(item)}>
              {viewIcons[item]}
              <span>{item}</span>
            </button>
          ))}
        </nav>
        <div className="status-panel">
          <span className={serverOnline ? 'dot online' : 'dot'} />
          <span>{serverOnline ? 'API connected' : 'Offline sample mode'}</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Rule-based compliance platform</p>
            <h1>{view}</h1>
          </div>
          <div className="top-actions">
            <div className="mobile-view-switcher">
              <SelectListbox label="View" value={view} options={viewOptions} onChange={(value) => onViewChange(value as View)} compact />
            </div>
            <SelectListbox label="Country" value={countryFilter} options={countryOptions} onChange={onCountryChange} compact />
            <label className="search-box">
              <FiSearch aria-hidden="true" />
              <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search laws, fines, sections" />
            </label>
            <button className="icon-button" onClick={onDarkToggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {dark ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </header>
        {children}
      </section>
    </main>
  )
}
