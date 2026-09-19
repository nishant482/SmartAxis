import Brand from './Brand'
import { Link } from '../lib/router'
import Icon from './Icon'

export default function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-top"><div><Brand/><p>Smart technology.<br/>Clear direction.</p></div>
      <div className="footer-column"><span>EXPLORE</span><Link to="/about">The studio</Link><Link to="/portfolio">Selected work</Link><Link to="/process">Our approach</Link><Link to="/contact">Contact</Link></div>
      <div className="footer-column"><span>EXPERTISE</span><Link to="/services/web-development">Web development</Link><Link to="/services/app-development">Mobile applications</Link><Link to="/services/ui-ux-design">Product design</Link><Link to="/services/saas-development">SaaS platforms</Link></div>
      <div className="footer-invite"><span className="status"><i/> OPEN TO WHAT’S NEXT</span><h3>Your ambition.<br/>Our next challenge.</h3><Link to="/contact">Start a conversation <Icon name="diagonal" size={18}/></Link></div>
    </div>
    <div className="footer-wordmark" aria-hidden="true">smartaxis<span>↗</span></div>
    <div className="footer-bottom"><span>© 2026 SmartAxis. All rights reserved.</span><div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div><span>Thoughtfully designed. Purposefully built.</span></div>
  </div></footer>
}
