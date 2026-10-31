import PageBanner from '../components/PageBanner'
import { useEffect } from 'react'
import { Link } from '../lib/router'
import { CTA, Eyebrow } from '../components/UI'
import ResourceState from '../components/ResourceState'
import { useResource } from '../lib/api'
import { portfolio } from '../data/portfolio'
import PortfolioArtwork from '../components/PortfolioArtwork'
import ProjectCard from '../components/ProjectCard'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { updateMetadata } from '../lib/seo'
export default function ProjectDetail({slug}) {
  const curated=portfolio.find(project=>project.id===slug)
  return curated?<ProjectContent project={curated}/>:<ManagedProject slug={slug}/>
}
function ManagedProject({slug}) {
  const resource=useResource(`/api/projects/${encodeURIComponent(slug)}`)
  if(resource.status===404)return <NotFound/>
  return resource.data?.project?<ProjectContent project={resource.data.project}/>:<><PageBanner eyebrow="OUR WORK" title="Project details"/><section className="container section"><ResourceState {...resource}/></section></>
}
function ProjectContent({project}) {
  const title=project.displayTitle||project.title,description=project.summary||project.description
  const isApp=project.link?.includes('play.google.com/'),screens=project.preview?.screens||[]
  const related=portfolio.filter(item=>item.id!==project.id&&item.category===project.category).slice(0,isApp?3:2)
  const capabilities=project.capabilities||(project.releaseStage==='testing'?['Android game','Testing release']:project.genre==='Education'?['Learning experience','Android application','Google Play publishing']:project.genre==='Games'?['Mobile gameplay','Android application','Google Play publishing']:['Mobile experience','Android application','Google Play publishing'])
  useEffect(()=>{updateMetadata(`/portfolio/${project.id}`,{title:`${title} | SmartXApp Studio Products`,description:description.slice(0,160),noindex:false})},[project.id,title,description])
  return <><PageBanner eyebrow={project.releaseStage==='testing'?'APP IN TESTING':project.genre||project.category} title={title} description={description} tone={isApp?'lavender':'blue'}><Link to={isApp?'/apps':'/websites'} className="text-link">{isApp?'All apps':'All websites'}</Link>{project.link&&<a href={project.link} className="button button-blue" target="_blank" rel="noopener noreferrer">{isApp?'Get it on Google Play':'View live website'}</a>}</PageBanner><section className="container product-detail-stage"><PortfolioArtwork key={project.id} project={project} detail/></section><section className="container product-overview section"><div><Eyebrow>THE EXPERIENCE</Eyebrow><h2>Designed with purpose.<br/><span className="text-muted">Built around its users.</span></h2></div><div><p>{description}</p><div className="product-capabilities">{capabilities.map(item=><span key={item}><Icon name="check" size={15}/>{item}</span>)}</div>{!project.preview?.desktop&&!isApp&&<p className="preview-disclosure">The visual above is an illustrative interface study. The source website currently restricts automated previews.</p>}{project.preview?.desktop&&project.category==='Business software'&&<p className="preview-disclosure">Public sign-in screen preview. Authenticated workspaces and customer data are not displayed.</p>}</div></section>{screens.length>0&&<section className="product-screen-gallery"><div className="container"><div className="section-heading"><div><Eyebrow>A CLOSER LOOK</Eyebrow><h2>The app.<br/><span className="text-muted">In its own pixels.</span></h2></div><span className="screens-provenance">Official screens from Google Play</span></div><div className="detail-screens">{screens.map((source,index)=><figure key={source}><img src={source} alt={`Official app screen ${index+1}`} loading="lazy"/></figure>)}</div></div></section>}{project.id==='vbike'&&<section className="container companion-project section"><div><Eyebrow>BEYOND THE WEBSITE</Eyebrow><h2>One connected<br/><span className="text-muted">product ecosystem.</span></h2><p>The web experience connects with a mobile app and dedicated business systems.</p><Link to="/portfolio/vbike-mobile" className="text-link">Explore the companion app </Link></div><Link to="/portfolio/vbike-mobile" aria-label="Explore the companion mobile app"><PortfolioArtwork project={portfolio.find(item=>item.id==='vbike-mobile')}/></Link></section>}{related.length>0&&<section className="container section related-products"><div className="section-heading"><div><Eyebrow>KEEP EXPLORING</Eyebrow><h2>More in this space.</h2></div><Link to="/portfolio" className="text-link">All products </Link></div><div className={isApp?"app-directory-grid":"product-editorial-grid"}>{related.map(item=><ProjectCard key={item.id} project={item}/>)}</div></section>}<CTA/></>
}
