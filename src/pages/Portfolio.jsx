import { useState } from 'react'
import { PageHero, CTA } from '../components/UI'
import ProjectCard from '../components/ProjectCard'
import ResourceState from '../components/ResourceState'
import { useResource } from '../lib/api'
export default function Portfolio() {
  const [filter,setFilter]=useState('All projects')
  const resource=useResource('/api/projects')
  const projects=resource.data?.projects||[]
  const shown=projects.filter(project=>filter==='All projects'||project.category===filter)
  const categories=['All projects',...new Set(projects.map(project=>project.category))]
  return <><PageHero number="03" eyebrow="OUR WORK" title="Ideas into experiences." accent="Built to make a difference." description="Explore the websites, applications, and digital experiences we have brought to life."/><section className="portfolio-page work-section section"><div className="container"><ResourceState {...resource} empty={!projects.length}><div className="filter-bar light-filter" aria-label="Filter projects">{categories.map(category=><button key={category} aria-pressed={filter===category} onClick={()=>setFilter(category)}>{category}</button>)}</div><p className="sr-only" aria-live="polite">{shown.length} projects shown</p><div className="projects-grid">{shown.map(project=><ProjectCard key={project.id} project={project}/>)}</div></ResourceState></div></section><CTA/></>
}
