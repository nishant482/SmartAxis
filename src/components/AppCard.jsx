import { useState } from 'react'
import Icon from './Icon'
export default function AppCard({project}){
  const [failed,setFailed]=useState(false)
  const title=project.displayTitle||project.title
  return <a className={`app-card curated-project ${project.releaseStage==='testing'?'app-testing':''}`} href={project.link} aria-label={`${title}${project.releaseStage==='testing'?' (testing)':''} — open on Google Play`}><span className="app-card-icon">{!failed&&project.image?<img src={project.image} alt="" loading="lazy" width="80" height="80" onError={()=>setFailed(true)}/>:<Icon name={project.genre==='Games'?'nodes':'phone'} size={34}/>}</span><h3>{title}</h3><span className="app-card-category">{project.genre||'Android app'}</span><span className="app-card-store">{project.releaseStage==='testing'?'Testing · Google Play':'Google Play'}</span></a>
}
