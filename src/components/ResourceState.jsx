export default function ResourceState({ loading, error, reload, empty, children }) {
  if (loading) return <div className="resource-state" role="status"><span className="loading-dot"/> Loading…</div>
  if (error) return <div className="resource-state" role="alert"><p>{error}</p><button onClick={reload} className="button button-outline">Try again</button></div>
  if (empty) return <div className="resource-state"><h3>Our next projects are on the way.</h3><p>Check back soon to explore our latest work.</p></div>
  return children
}
