import { Link } from '../lib/router'
export default function Brand(){
  return <Link to="/" className="brand" aria-label="SmartXApp Studio home"><svg width="34" height="34" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="m18 5 13 7-13 7-13-7 13-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="m5 18 13 7 13-7M5 24l13 7 13-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span className="studio-brand-name">SmartXApp<span className="studio-brand-subtitle">STUDIO</span></span></Link>
}
