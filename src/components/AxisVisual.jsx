import sculpture from '../assets/axis-sculpture.webp'

export default function AxisVisual({ small = false }) {
  return <div className={`axis-art ${small ? 'axis-art-small' : ''}`}>
    <img className="axis-image" src={sculpture} width="1254" height="1254" alt="Sculptural intertwined cobalt-blue glass loops, representing connected ideas and technology" fetchPriority={small ? 'auto' : 'high'} loading={small ? 'lazy' : 'eager'}/>
    {!small && <><div className="art-label"><span/> IDEAS, CONNECTED.</div><div className="art-chip chip-design"><span>01 /</span> Thoughtful design <b>↗</b></div><div className="art-chip chip-grow"><span className="chip-symbol">✳</span><div>One connected team.<br/><strong>Endless possibilities.</strong></div></div><div className="art-caption"><span>THE SMARTAXIS EFFECT</span><span>DESIGN × TECHNOLOGY</span></div></>}
  </div>
}

