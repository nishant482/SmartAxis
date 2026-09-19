import { Link } from '../lib/router'
import Icon from './Icon'
export default function ProjectCard({project}) {
  return <article className="project-card managed-project"><Link to={`/portfolio/${project.id}`} className="managed-project-cover"><img src={project.image} alt={`${project.title} project preview`} loading="lazy"/></Link><div className="project-card-info"><div><span>{project.category}</span><h3><Link to={`/portfolio/${project.id}`}>{project.title}</Link></h3><p>{project.description}</p></div><a href={project.link} target="_blank" rel="noopener noreferrer" className="round-arrow" aria-label={`Visit ${project.title} website (opens in a new tab)`}><Icon name="diagonal"/></a></div></article>
}
