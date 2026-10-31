import PageBanner from './PageBanner'
import { Link } from '../lib/router'

export function Eyebrow({ children }) { return <div className="eyebrow"><span/>{children}</div> }

export function PageHero({ number, eyebrow, title, accent, description, children }) {
  const tone=number==='APPS'?'lavender':number==='JOURNAL'?'peach':'mint'
  return <PageBanner eyebrow={eyebrow} title={title} accent={accent} description={description} tone={tone}>{children}</PageBanner>
}

export function Button({ to = '/contact', children, secondary = false }) {
  return <Link to={to} className={`button ${secondary ? 'button-outline' : 'button-blue'}`}>{children}</Link>
}

export function CTA() {
  return <section className="cta-section"><div className="container cta-content"><div><Eyebrow>HAVE SOMETHING IN MIND?</Eyebrow><h2>Good things start<br/>with <span>a conversation.</span></h2></div><Link to="/contact" className="cta-circle" aria-label="Start your project"><span>LET’S TALK</span></Link><div className="cta-foot"><p>Tell us what you need.<br/>We’ll help you take the next step.</p><span>SMARTXAPP STUDIO </span></div></div></section>
}
