import { Link } from '../lib/router'
import PageBanner from '../components/PageBanner'
import { devotionalPages,bhaktiStoreUrl,bhaktiScreens } from '../data/devotional'
export default function DevotionalApp({path}){
 const page=devotionalPages.find(item=>item.path===path)||devotionalPages[0]
 return <><PageBanner eyebrow="SANATAN BHAKTI & DEVOTIONAL" title={page.title} description={page.intro} tone="saffron"><a className="button button-blue" href={bhaktiStoreUrl} target="_blank" rel="noopener noreferrer">Get it on Google Play</a><Link to="/apps" className="text-link">All apps</Link></PageBanner>
 <article className="container devotional-guide"><nav className="guide-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/apps">Apps</Link>{page.path!=='/apps/sanatan-bhakti'&&<><span>/</span><Link to="/apps/sanatan-bhakti">Sanatan Wallpaper</Link></>}</nav>
 <div className="devotional-guide-layout"><div>{page.sections.map(([heading,text])=><section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}<section><h2>Common questions</h2>{page.faqs.map(([question,answer])=><details className="guide-faq" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section></div>
 <aside className="guide-app-panel"><img src="/portfolio/apps/sanatan-bhakti.webp" alt="Sanatan Wallpaper app icon" width="80" height="80"/><h2>Sanatan Wallpaper</h2><p>Android app by SmartAxis</p><a href={bhaktiStoreUrl} className="button button-blue" target="_blank" rel="noopener noreferrer">View on Google Play</a><small>Package: com.sanatan.bhakti.app</small></aside></div>
 <section className="guide-related"><h2>Explore the devotional collection</h2><div className="guide-topic-links">{devotionalPages.filter(item=>item.path!==page.path).map(item=><Link key={item.path} to={item.path}>{item.title}</Link>)}</div><Link className="text-link" to="/apps/sanatan-wallpapers">Our other Hindu God wallpaper app</Link></section>
 <section><h2>Official app previews</h2><p>These Google Play screenshots show the app experience. Individual festival images and content may vary.</p><div className="guide-screens">{bhaktiScreens.map((src,i)=><img key={src} src={src} alt={'Sanatan Wallpaper official app preview '+(i+1)} loading="lazy"/>)}</div><p className="guide-source">Feature information checked against the <a href={bhaktiStoreUrl} target="_blank" rel="noopener noreferrer">official Google Play listing</a> on 3 November 2026.</p></section>
 </article></>
}
