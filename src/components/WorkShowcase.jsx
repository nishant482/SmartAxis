import { useState } from 'react'
import { Link } from '../lib/router'
import { useResource } from '../lib/api'
import ResourceState from './ResourceState'
import Icon from './Icon'
export default function WorkShowcase() {
  const resource=useResource('/api/projects'),[selected,setSelected]=useState(0)
  const all=resource.data?.projects||[],featured=all.filter(project=>project.featured)
  const projects=(featured.length?featured:all).slice(0,4),project=projects[Math.min(selected,projects.length-1)]
  function handleKeys(event) {
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return
    event.preventDefault()
    const next=event.key==='Home'?0:event.key==='End'?projects.length-1:(selected+(event.key==='ArrowRight'?1:projects.length-1))%projects.length
    setSelected(next);document.getElementById(`work-tab-${next}`).focus()
  }
  return <ResourceState {...resource} empty={!projects.length}>{project&&<div className="work-explorer"><div className="work-selector" role="tablist" aria-label="Explore projects">{projects.map((item,index)=><button key={item.id} role="tab" id={`work-tab-${index}`} aria-selected={selected===index} aria-controls="work-preview" tabIndex={selected===index?0:-1} onKeyDown={handleKeys} onClick={()=>setSelected(index)}><span>0{index+1}</span>{item.title}<Icon name="diagonal" size={16}/></button>)}</div><div className="work-preview managed-work-preview" role="tabpanel" id="work-preview" aria-labelledby={`work-tab-${selected}`}><div className="work-story" key={project.id}><span className="work-category">{project.category}</span><h3>{project.title}</h3><p>{project.description}</p><Link to={`/portfolio/${project.id}`} className="button button-light">Inside the project <Icon name="diagonal" size={18}/></Link><a href={project.link} target="_blank" rel="noopener noreferrer" className="text-link">Visit website <Icon name="diagonal" size={15}/></a><span className="work-page-number">0{selected+1}<span> / {String(projects.length).padStart(2,'0')}</span></span></div><Link className="managed-work-image" to={`/portfolio/${project.id}`} aria-label={`View ${project.title} project`}><img src={project.image} alt={`${project.title} project preview`} loading="lazy"/></Link></div></div>}</ResourceState>
}
