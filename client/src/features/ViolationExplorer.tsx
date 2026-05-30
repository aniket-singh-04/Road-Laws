import { FiAlertTriangle } from 'react-icons/fi'
import type { Violation } from '../types'

export function ViolationExplorer({ violations }: { violations: Violation[] }) {
  return (
    <section className="list">
      {violations.map((violation) => (
        <article className="panel" key={violation.id}>
          <div className="row">
            <h2><FiAlertTriangle aria-hidden="true" /> {violation.name}</h2>
            <strong>INR {violation.baseFine.toLocaleString('en-IN')}</strong>
          </div>
          <p>{violation.enforcementNotes}</p>
          <div className="meta">{violation.section} - Repeat fine INR {violation.repeatFine.toLocaleString('en-IN')}</div>
          <p>{violation.licenseConsequence}</p>
        </article>
      ))}
    </section>
  )
}
