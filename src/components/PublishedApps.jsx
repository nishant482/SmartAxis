import { developerUrl,ownedProjects } from '../data/portfolio'
import AppCatalogue from './AppCatalogue'
import { Eyebrow } from './UI'
export function ProjectNames(){return <div className="project-names container"><span>SELECTED EXPERIENCES</span><div>{ownedProjects.slice(0,5).map(project=><a key={project.id} href={project.link} target="_blank" rel="noopener noreferrer">{project.displayTitle||project.title}</a>)}</div></div>}
export default function PublishedApps(){return <section id="our-apps" className="published-apps section"><div className="container"><div className="section-heading"><div><Eyebrow>OUR ANDROID APPS</Eyebrow><h2>Made for your everyday.</h2><p className="apps-intro">Learn something. Make it yours. Find a little play.</p></div><a href={developerUrl} className="text-link" target="_blank" rel="noopener noreferrer">View Google Play catalogue</a></div><AppCatalogue/></div></section>}
