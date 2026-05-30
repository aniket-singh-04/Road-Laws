import { FiBookOpen } from 'react-icons/fi'
import { SelectListbox } from '../components/SelectListbox'
import type { Law, Region } from '../types'

type Props = {
  laws: Law[]
  regions: Region[]
  stateFilter: string
  onStateChange: (value: string) => void
}

export function LawExplorer({ laws, regions, stateFilter, onStateChange }: Props) {
  const regionOptions = [{ value: 'all', label: 'All regions' }, ...regions.map((region) => ({ value: region.id, label: region.name, description: region.code }))]

  return (
    <>
      <div className="toolbar">
        <SelectListbox label="Region" value={stateFilter} options={regionOptions} onChange={onStateChange} compact />
      </div>
      <p className="meta">{laws.length} rules visible from national, state, and local coverage.</p>
      <section className="list">
        {laws.map((law) => (
          <article className="panel" key={law.id}>
            <div className="row">
              <h2><FiBookOpen aria-hidden="true" /> {law.title}</h2>
              <span className="pill">{law.stateId.toUpperCase()}</span>
            </div>
            <p>{law.description}</p>
            <div className="meta">{law.section} - {law.legalSource} - Effective {law.effectiveDate}</div>
            <div className="tags">{law.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </article>
        ))}
      </section>
    </>
  )
}
