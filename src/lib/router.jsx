import { useEffect, useState } from 'react'
import { RouterContext, useRouter } from './RouterContext'

export function Router({ children, initialPath }) {
  const [path, setPath] = useState(initialPath || (typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/'))

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname.replace(/\/$/, '') || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function navigate(to) {
    if (to === path) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}

export function Link({ to, children, onClick, ...props }) {
  const { navigate } = useRouter()
  return <a href={to} {...props} onClick={event => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === '_blank') return
    event.preventDefault()
    navigate(to)
  }}>{children}</a>
}
