import { useEffect, useRef } from 'react'
import { Router } from './lib/router'
import { lazy, Suspense } from 'react'
import { useRouter } from './lib/RouterContext'
import { updateMetadata } from './lib/seo'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Solutions from './pages/Solutions'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Process from './pages/Process'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import './App.css'

const Admin = lazy(() => import('./pages/Admin'))

const pages = {
  '/': [Home, 'Digital experiences. Real impact.'],
  '/services': [Services, 'Our expertise'],
  '/solutions': [Solutions, 'Solutions for your business'],
  '/portfolio': [Portfolio, 'Selected work'],
  '/about': [About, 'The studio'],
  '/process': [Process, 'Our approach'],
  '/contact': [Contact, 'Let’s talk'],
  '/privacy': [Privacy, 'Privacy'],
  '/terms': [Terms, 'Terms'],
}

function Site() {
  const { path } = useRouter()
  const isAdmin = path === '/admin' || path.startsWith('/admin/')
  const initial = useRef(true)
  const main = useRef(null)
  const [Page, title] = pages[path] || [NotFound, 'Page not found']
  const serviceSlug = path.startsWith('/services/') ? path.slice(10) : null
  const projectSlug = path.startsWith('/portfolio/') ? path.slice(11) : null

  useEffect(() => {
    updateMetadata(path)
    if (!initial.current) main.current?.focus({ preventScroll: true })
    initial.current = false
  }, [path, title, serviceSlug, projectSlug, isAdmin])

  if (isAdmin) return <Suspense fallback={<div className="resource-state">Loading admin…</div>}><Admin/></Suspense>
  return <><a href="#main" className="skip-link">Skip to content</a><Header/><main ref={main} id="main" tabIndex={-1}>{serviceSlug ? <ServiceDetail key={path} slug={serviceSlug}/> : projectSlug ? <ProjectDetail key={path} slug={projectSlug}/> : <Page key={path}/>}</main><Footer/></>
}

export default function App({ initialPath }) { return <Router initialPath={initialPath}><Site/></Router> }

import './styles/light.css'
import './styles/studio.css'
import './styles/future.css'
import './styles/header.css'
import './styles/backend-ui.css'
