import { Link } from '../lib/router'
import Icon from './Icon'

export function Eyebrow({ children }) { return <div className="eyebrow"><span/>{children}</div> }

export function PageHero({ number, eyebrow, title, accent, description, children }) {
  return <section className="page-hero container"><div className="page-topline"><Eyebrow>{eyebrow}</Eyebrow><span>SMARTAXIS — {number}</span></div><h1>{title}<br/><span className="text-muted">{accent}</span></h1><div className="page-hero-bottom"><p>{description}</p>{children || <span className="page-scroll">SCROLL TO EXPLORE <span>↓</span></span>}</div></section>
}

export function Button({ to = '/contact', children, secondary = false }) {
  return <Link to={to} className={`button ${secondary ? 'button-outline' : 'button-blue'}`}>{children}<Icon name="diagonal" size={18}/></Link>
}

export function CTA() {
  return <section className="cta-section"><div className="container cta-content"><div><Eyebrow>GOOD THINGS START WITH A CONVERSATION</Eyebrow><h2>Something in mind?<br/>Let’s make it <span>happen.</span></h2></div><Link to="/contact" className="cta-circle" aria-label="Start your project"><Icon name="diagonal" size={44}/><span>LET’S TALK</span></Link><div className="cta-foot"><p>From the first spark to the next big thing.<br/>We’re ready when you are.</p><span>YOUR NEXT CHAPTER STARTS HERE ↗</span></div></div></section>
}
