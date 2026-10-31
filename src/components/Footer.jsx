import Brand from './Brand'
import { Link } from '../lib/router'

export default function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-top"><div><Brand/><p>Smart technology.<br/>Clear direction.</p></div>
      <div className="footer-column"><span>EXPLORE</span><Link to="/about">About us</Link><Link to="/websites">Websites</Link><Link to="/apps">Our apps</Link><Link to="/blogs">Blogs</Link><Link to="/contact">Contact</Link></div>
      <div className="footer-column"><span>SERVICES</span><Link to="/services/web-development">Web development</Link><Link to="/services/app-development">Mobile applications</Link><Link to="/services/ui-ux-design">Product design</Link><Link to="/services/saas-development">SaaS platforms</Link></div>
      <div className="footer-invite"><span className="status"><i/> OPEN TO WHAT’S NEXT</span><h3>Ready to grow?<br/>Let’s talk.</h3><Link to="/contact">Contact us </Link></div>
    </div>
    <div className="footer-bottom"><span>© 2026 SmartXApp Studio. All rights reserved.</span><div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div><span>Good design. Built with care.</span></div>
  </div></footer>
}
