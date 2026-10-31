import { useState } from 'react'
import PageBanner from '../components/PageBanner'
import { CTA } from '../components/UI'
import ProjectCard from '../components/ProjectCard'
import { usePortfolio } from '../lib/portfolio'
export default function Portfolio(){const [query,setQuery]=useState('');const projects=usePortfolio().filter(p=>p.link&&!p.link.includes('play.google.com/'));const shown=projects.filter(p=>(p.displayTitle+' '+p.description).toLowerCase().includes(query.toLowerCase()));return <><PageBanner eyebrow="OUR WEBSITES" title="Websites with purpose." description="Business websites, online stores and web platforms we have built." tone="blue"/><section className="container section website-collection"><label className="product-search"><span className="sr-only">Search websites</span><input type="search" placeholder="Search websites" value={query} onChange={e=>setQuery(e.target.value)}/></label><p className="portfolio-results" role="status">{shown.length} websites</p><div className="product-editorial-grid">{shown.map(project=><ProjectCard key={project.id} project={project}/>)}</div>{!shown.length&&<p>No matching websites.</p>}</section><CTA/></>}
