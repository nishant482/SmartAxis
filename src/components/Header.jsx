import { useEffect, useRef, useState } from 'react'
import { Link } from '../lib/router'
import { useCallback } from 'react'
import { useRouter } from '../lib/RouterContext'
import Brand from './Brand'
import Icon from './Icon'

export default function Header() {
  const [menu, setMenu] = useState({open:false,path:null})
  const toggle = useRef(null)
  const navigation = useRef(null)
  const { path } = useRouter()
  const open = menu.open && menu.path === path
  const setOpen = useCallback(value => setMenu({open:value,path}), [path])
  useEffect(() => {
    const close = () => setMenu(previous => ({...previous,open:false}))
    window.addEventListener('popstate',close)
    return () => window.removeEventListener('popstate',close)
  }, [])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    navigation.current?.querySelector('a')?.focus()
    function onKey(event) {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
      if (event.key === 'Tab') {
        const links = [...navigation.current.querySelectorAll('a')]
        const first = links[0]
        const last = links[links.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); toggle.current?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); toggle.current?.focus() }
        else if (!event.shiftKey && document.activeElement === toggle.current) { event.preventDefault(); first?.focus() }
        else if (event.shiftKey && document.activeElement === toggle.current) { event.preventDefault(); last?.focus() }
      }
    }
    const onResize = () => { if (window.innerWidth > 1000) setOpen(false) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize) }
  }, [open, setOpen])
  const links = [['Home', '/'], ['Services', '/services'], ['Solutions', '/solutions'], ['Our work', '/portfolio'], ['About', '/about'], ['Process', '/process']]
  return <header className={`site-header header-shell ${open ? 'header-menu-open' : ''}`}>
    <div className="container navigation">
      <Brand />
      <nav ref={navigation} id="main-navigation" className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        {links.map(([label, to]) => <Link key={to} to={to} aria-current={(to === '/' ? path === '/' : path.startsWith(to)) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link to="/contact" className="mobile-contact" onClick={() => setOpen(false)}>Contact us</Link>
      </nav>
      <Link to="/contact" className="header-contact" aria-current={path === '/contact' ? 'page' : undefined} onClick={() => setOpen(false)}><span className="contact-label-desktop">Start a project</span><span className="contact-label-mobile">Let’s talk</span><span className="contact-arrow"><Icon name="diagonal" size={16}/></span></Link>
      <button ref={toggle} className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? '✕' : <><span/><span/></>}</button>
    </div>
  </header>
}
