import { useState } from 'react'
import { Link } from '../lib/router'
import { usePortfolio } from '../lib/portfolio'
import PortfolioArtwork from './PortfolioArtwork'
import Icon from './Icon'
export default function WorkShowcase() {
  const all=usePortfolio(),[selected,setSelected]=useState(0),featured=all.filter(project=>project.featured)
  const projects=(featured.length?featured:all).slice(0,4),active=Math.min(selected,projects.length-1),project=projects[active]
  function handleKeys(event) {
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return
    event.preventDefault()
    const next=event.key==='Home'?0:event.key==='End'?projects.length-1:(active+(event.key==='ArrowRight'?1:projects.length-1))%projects.length
    setSelected(next);document.getElementById(`work-tab-${next}`)?.focus()
  }
  return project&&<div className="work-explorer"><div className="work-selector" role="tablist" aria-label="Explore projects">{projects.map((item,index)=><button key={item.id} role="tab" id={`work-tab-${index}`} aria-selected={active===index} aria-controls="work-preview" tabIndex={active===index?0:-1} onKeyDown={handleKeys} onClick={()=>setSelected(index)}><span>0{index+1}</span>{item.displayTitle||item.title}<Icon name="diagonal" size={16}/></button>)}</div><div className="work-preview managed-work-preview curated-work-preview" role="tabpanel" id="work-preview" aria-labelledby={`work-tab-${active}`}><div className="work-story" key={project.id}><span className="work-category">{project.genre||project.category}</span><h3>{project.displayTitle||project.title}</h3><p>{project.summary||project.description}</p><Link to={`/portfolio/${project.id}`} className="button button-light">Explore project <Icon name="diagonal" size={18}/></Link>{project.link&&<a href={project.link} target="_blank" rel="noopener noreferrer" className="text-link">{project.link?.includes('play.google.com/')?'Get it on Google Play':'Visit website'}<Icon name="diagonal" size={15}/></a>}<span className="work-page-number">0{active+1}<span> / {String(projects.length).padStart(2,'0')}</span></span></div><Link className="curated-work-art" to={`/portfolio/${project.id}`} aria-label={`Explore ${project.displayTitle||project.title}`}><PortfolioArtwork key={project.id} project={project}/></Link></div></div>
}
