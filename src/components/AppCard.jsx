import { useState } from 'react'
import Icon from './Icon'
export default function AppCard({project}){
  const [failed,setFailed]=useState(false)
  const title=project.displayTitle||project.title
  return <a className="app-card curated-project" href={project.link} aria-label={`${title} — open on Google Play`}><span className="app-card-icon">{!failed&&project.image?<img src={project.image} alt="" loading="lazy" width="80" height="80" onError={()=>setFailed(true)}/>:<Icon name="phone" size={34}/>}</span><h3>{title}</h3><span className="app-card-category">{project.genre||'Android app'}</span><span className="app-card-store">Google Play</span></a>
}
