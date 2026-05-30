export function AdminView() {
  return (
    <section className="grid two">
      <div className="panel">
        <h2>CMS modules</h2>
        <div className="doc-list">
          <span>Laws and legal references</span>
          <span>Violations and fine schedules</span>
          <span>States, cities, enforcement zones</span>
          <span>Users, roles, notifications, audit logs</span>
        </div>
      </div>
      <div className="panel">
        <h2>Access model</h2>
        <p>Traffic officers can publish notices, state admins manage local law data, and super admins own global configuration.</p>
      </div>
    </section>
  )
}
