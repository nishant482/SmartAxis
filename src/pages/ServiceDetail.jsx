import { services } from '../data/site'
import { Link } from '../lib/router'
import { PageHero, Eyebrow, Button, CTA } from '../components/UI'
import Icon from '../components/Icon'
import NotFound from './NotFound'

export default function ServiceDetail({ slug }) {
  const service = services.find(s => s.slug === slug)
  if (!service) return <NotFound/>
  return <><div className="container breadcrumb"><Link to="/services">All services</Link><span>/</span>{service.title}</div><PageHero number={service.number} eyebrow={service.category} title={service.title + '.'} accent="Thoughtfully engineered." description={service.detail}><Button>Discuss your project</Button></PageHero><section className="container section service-detail-layout"><div className="capability-art"><Icon name={service.icon} size={115}/><div className="capability-ring"/><span>SMARTAXIS / {service.number}</span><h2>{service.description}</h2></div><div><Eyebrow>WHAT WE BRING TO THE TABLE</Eyebrow><h2>Everything you need.<br/><span className="text-muted">Nothing you don’t.</span></h2><div className="deliverables">{service.deliverables.map((d,i)=><div key={d}><span>0{i+1}</span><h3>{d}</h3><Icon name="check" size={19}/></div>)}</div><div className="stack-note"><small>THE TOOLS BEHIND THE CRAFT</small><p>{service.stack}</p></div></div></section><section className="container section detail-next"><Eyebrow>AN APPROACH THAT MAKES SENSE</Eyebrow><div className="three-columns">{[['Understand','We start with your goals, users, and constraints. The brief comes before the build.'],['Create','Design and engineering work together in focused iterations, with your feedback along the way.'],['Evolve','We test, launch, document, and plan the improvements that come next.']].map(([t,d],i)=><article key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section><CTA/></>
}
