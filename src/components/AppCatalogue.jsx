import { useState } from 'react'
import { catalogueApps } from '../data/portfolio'
import { appCategories,appCategory } from '../data/content-categories'
import AppCard from './AppCard'
export default function AppCatalogue({apps=catalogueApps,searchable=false}){
  const [filter,setFilter]=useState('all'),[query,setQuery]=useState('')
  const categories=appCategories.filter(category=>apps.some(app=>appCategory(app)===category.id))
  const activeFilter=categories.some(category=>category.id===filter)?filter:'all'
  const visible=apps.filter(app=>(activeFilter==='all'||appCategory(app)===activeFilter)&&`${app.title} ${app.displayTitle||''} ${app.summary||''}`.toLowerCase().includes(query.trim().toLowerCase()))
  return <div className="app-catalogue"><div className="category-controls"><div className="category-tabs" aria-label="Filter app categories"><button aria-pressed={activeFilter==='all'} onClick={()=>setFilter('all')}>All apps</button>{categories.map(category=><button key={category.id} aria-pressed={activeFilter===category.id} onClick={()=>setFilter(category.id)}>{category.label}</button>)}</div>{searchable&&<label className="product-search"><span className="sr-only">Search apps</span><input type="search" placeholder="Search apps…" value={query} onChange={event=>setQuery(event.target.value)}/></label>}</div><span className="sr-only" role="status">{visible.length} apps shown</span>{categories.filter(category=>visible.some(app=>appCategory(app)===category.id)).map(category=><section key={category.id} className="app-category-section" aria-labelledby={`category-${category.id}`}><div className="app-category-heading"><div><h3 id={`category-${category.id}`}>{category.label}</h3><p>{category.description}</p></div><span>{visible.filter(app=>appCategory(app)===category.id).length} {visible.filter(app=>appCategory(app)===category.id).length===1?'app':'apps'}</span></div><div className="app-directory-grid">{visible.filter(app=>appCategory(app)===category.id).map(project=><AppCard key={project.id} project={project}/>)}</div></section>)}{!visible.length&&<p className="catalogue-empty">No matching apps. Try another search.</p>}</div>
}
