import { useState } from 'react'
import { services } from '../data/site'
import { Link } from '../lib/router'
import { PageHero, CTA } from '../components/UI'
import Icon from '../components/Icon'

export default function Services() {
  const [filter, setFilter] = useState('All capabilities')
  const categories = ['All capabilities', 'Development', 'Design', 'Commerce', 'Integration', 'Support']
  const visible = services.filter(s => filter === 'All capabilities' || s.category === filter.toUpperCase())
  return <><PageHero number="01" eyebrow="OUR EXPERTISE" title="Built around your ambition." accent="Not the other way around." description="From the first sketch to the final line of code. A full spectrum of digital capabilities, connected by one clear purpose: your progress."/><section className="container section section-no-top"><div className="filter-bar" aria-label="Filter services">{categories.map(c=><button key={c} aria-pressed={filter===c} onClick={()=>setFilter(c)}>{c}{filter===c&&<span>↗</span>}</button>)}</div><p className="sr-only" aria-live="polite">{visible.length} services shown</p><div className="services-page-grid">{visible.map(s=><Link to={`/services/${s.slug}`} className="service-detail-card" key={s.slug}><div className="service-card-top"><span>{s.number} / {s.category}</span><Icon name={s.icon} size={31}/></div><h2>{s.title}</h2><p>{s.detail}</p><div className="service-tags">{s.deliverables.slice(0,2).map(d=><span key={d}>{d}</span>)}</div><div className="service-card-link">Explore capability <Icon name="diagonal" size={20}/></div></Link>)}</div><div className="service-help"><Icon name="nodes" size={33}/><div><h3>Not sure where to start?</h3><p>You bring the challenge. We’ll help find the right approach.</p></div><Link to="/contact" className="text-link">Let’s figure it out <Icon name="diagonal" size={18}/></Link></div></section><CTA/></>
}
