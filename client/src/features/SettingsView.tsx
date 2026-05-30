import { apiBase } from '../lib/api'

export function SettingsView({ serverOnline }: { serverOnline: boolean }) {
  return (
    <section className="grid two">
      <div className="panel">
        <h2>Environment</h2>
        <p>API base: {apiBase}</p>
        <p>Status: {serverOnline ? 'connected' : 'offline sample mode'}</p>
      </div>
      <div className="panel">
        <h2>Excluded by request</h2>
        <p>Winston Logger, Morgan, Health Checks, Docker, Docker Compose, and Nginx are intentionally not implemented.</p>
      </div>
    </section>
  )
}
