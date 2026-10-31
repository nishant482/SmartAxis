import { useEffect,useState } from 'react'
import { api } from './api'
import { portfolio,mergePortfolio } from '../data/portfolio'
// Public work is available during prerendering and without a database.
// Published admin records can update the curated catalogue or add new projects.
export function usePortfolio(){
  const [projects,setProjects]=useState(portfolio)
  useEffect(()=>{
    const controller=new AbortController()
    api('/api/projects',{signal:controller.signal}).then(data=>{if(Array.isArray(data.projects))setProjects(mergePortfolio(data.projects))}).catch(()=>{/* Keep the curated catalogue available while the API is offline. */})
    return ()=>controller.abort()
  },[])
  return projects
}
