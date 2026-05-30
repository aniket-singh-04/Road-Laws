import { FiMapPin } from 'react-icons/fi'
import type { Zone } from '../types'

export function MapExplorer({ zones }: { zones: Zone[] }) {
  return (
    <section className="map-layout">
      <div className="map-canvas" aria-label="Legal zone map visualization">
        {zones.map((zone, index) => (
          <button
            key={zone.id}
            className={`zone-pin pin-${index + 1}`}
            title={zone.name}
            style={{ ['--speed' as string]: `${Math.min(zone.speedLimitKmph * 2, 90)}px` }}
          >
            {zone.speedLimitKmph}
          </button>
        ))}
      </div>
      <div className="list">
        {zones.map((zone) => (
          <article className="panel" key={zone.id}>
            <div className="row">
              <h2><FiMapPin aria-hidden="true" /> {zone.name}</h2>
              <span className="pill">{zone.type}</span>
            </div>
            <p>{zone.restrictions.join(', ')}</p>
            <div className="meta">Speed limit {zone.speedLimitKmph} kmph - Radius {zone.radiusMeters}m</div>
          </article>
        ))}
      </div>
    </section>
  )
}
