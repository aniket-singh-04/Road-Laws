import { FiAlertCircle, FiDatabase, FiFileText, FiMapPin, FiShield, FiTruck } from 'react-icons/fi'
import { Metric } from '../components/Metric'
import type { Country, Dashboard, FineRule, Law, LegalDocument, Violation, Zone } from '../types'

type Props = {
  data: Dashboard
  country: Country
  laws: Law[]
  violations: Violation[]
  zones: Zone[]
  fineRules: FineRule[]
  legalDocuments: LegalDocument[]
}

export function DashboardView({ data, country, laws, violations, zones, fineRules, legalDocuments }: Props) {
  return (
    <>
      <section className="metrics">
        <Metric label="Compliance score" value={`${data.complianceScore}/100`} />
        <Metric label="Visible laws" value={String(laws.length)} />
        <Metric label="Violations" value={String(violations.length)} />
        <Metric label="Fine rules" value={String(fineRules.length)} />
      </section>
      <section className="overview-strip">
        <article>
          <FiDatabase aria-hidden="true" />
          <span>{country.nationalFramework}</span>
        </article>
        <article>
          <FiMapPin aria-hidden="true" />
          <span>{zones.length} geofenced zones loaded</span>
        </article>
        <article>
          <FiFileText aria-hidden="true" />
          <span>{legalDocuments.length} legal documents indexed</span>
        </article>
      </section>
      <section className="grid two">
        <div className="panel">
          <h2>{data.profile.name}</h2>
          <p>{data.profile.email}</p>
          <span className="pill">{data.profile.role.replace('_', ' ')}</span>
        </div>
        <div className="panel">
          <h2>Legal alerts</h2>
          {data.legalAlerts.map((alert) => (
            <article className="compact" key={alert.id}>
              <strong><FiAlertCircle aria-hidden="true" /> {alert.title}</strong>
              <p>{alert.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="grid two">
        {data.vehicles.map((vehicle) => (
          <article className="panel" key={vehicle.id}>
            <h2><FiTruck aria-hidden="true" /> {vehicle.plate}</h2>
            <p>{vehicle.type}</p>
            <div className="doc-list">
              {vehicle.documents.map((doc) => (
                <span key={doc.type}><FiShield aria-hidden="true" /> {doc.type}: {doc.expiresAt}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
