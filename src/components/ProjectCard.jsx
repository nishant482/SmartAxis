import { Link } from '../lib/router'
import Icon from './Icon'
import PortfolioArtwork from './PortfolioArtwork'
export default function ProjectCard({project}) {
  const name=project.displayTitle||project.title
  const isApp=project.link?.includes('play.google.com/')
  return <article className="project-card managed-project curated-project"><Link to={`/portfolio/${project.id}`} className="curated-cover" aria-label={`Explore ${name}`}><PortfolioArtwork project={project}/><span className="product-cover-action">Explore experience <Icon name="diagonal" size={16}/></span></Link><div className="project-card-info"><div><span>{project.genre||project.category}</span><h3><Link to={`/portfolio/${project.id}`}>{name}</Link></h3><p>{project.summary||project.description}</p></div><Link to={`/portfolio/${project.id}`} className="round-arrow" aria-label={`Explore ${name} details`}><Icon name="diagonal"/></Link></div><div className="product-card-foot"><span><i/>{isApp?'Available on Google Play':project.category==='Business software'?'Business application':'Design & development'}</span>{project.link&&<a href={project.link} target="_blank" rel="noopener noreferrer">{isApp?'Google Play':'Visit website'}<Icon name="diagonal" size={13}/></a>}</div></article>
}
