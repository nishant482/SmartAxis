import { Link } from '../lib/router'
import { PageHero, CTA } from '../components/UI'
import ResourceState from '../components/ResourceState'
import { useResource } from '../lib/api'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { useEffect } from 'react'
import { updateMetadata } from '../lib/seo'
export default function ProjectDetail({slug}) {
  const resource=useResource(`/api/projects/${encodeURIComponent(slug)}`),project=resource.data?.project
  useEffect(()=>{
    if(project)updateMetadata(`/portfolio/${slug}`,{title:`${project.title} | SmartAxis Projects`,description:project.description.slice(0,160),noindex:false})
    else if(resource.status===404)updateMetadata(`/portfolio/${slug}`,{title:'Project not found | SmartAxis',noindex:true})
  },[project,slug,resource.status])
  if(resource.status===404) return <NotFound/>
  return <>{!project&&<section className="container section"><h1>Project details</h1><ResourceState {...resource}/></section>}{project&&<><div className="container breadcrumb"><Link to="/portfolio">Our work</Link><span>/</span>{project.title}</div><PageHero number="PROJECT" eyebrow={project.category} title={project.title} accent="Designed. Built. Delivered." description={project.description}/><section className="container section section-no-top managed-detail"><img src={project.image} alt={`${project.title} project preview`} className="managed-detail-image"/><div className="managed-detail-actions"><Link to="/portfolio" className="button button-outline">← Back to all projects</Link><a href={project.link} className="button button-blue" target="_blank" rel="noopener noreferrer">Visit live project <Icon name="diagonal" size={18}/></a></div></section><CTA/></>}</>
}
