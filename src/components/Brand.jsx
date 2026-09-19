import { Link } from '../lib/router'

export default function Brand() {
  return <Link to="/" className="brand" aria-label="SmartAxis home">
    <svg width="34" height="34" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M7 28 18 7l11 21M11 21h14M18 7v23" stroke="currentColor" strokeWidth="2.7"/><circle cx="18" cy="7" r="3" fill="currentColor"/><circle cx="7" cy="28" r="3" fill="currentColor"/><circle cx="29" cy="28" r="3" fill="currentColor"/></svg>
    <span>SmartAxis<span className="brand-period">®</span></span>
  </Link>
}
