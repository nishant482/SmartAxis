import { useState } from 'react'
import Icon from './Icon'

function InterfaceStudy({project}) {
  return <div className={`interface-study study-${project.previewType||'industry'}`} aria-label="Illustrative interface study">
    <div className="study-sidebar"><Icon name={project.previewType==='dashboard'?'nodes':'code'} size={24}/>{[0,1,2,3].map(i=><i key={i}/>)}</div>
    <div className="study-content"><div className="study-nav"><span/><i/><i/></div><div className="study-title"><span/><span/></div><div className="study-panels">{[0,1,2].map(i=><div key={i}><Icon name={project.previewType==='industry'?'nodes':i===0?'shop':'code'} size={30}/><i/><i/></div>)}</div><div className="study-chart"><svg viewBox="0 0 400 100" aria-hidden="true"><path d="M0 87L42 69L78 78L122 45L155 51L210 23L250 40L291 13L332 20L400 0" fill="none" stroke="currentColor" strokeWidth="2"/></svg></div></div>
  </div>
}
export default function PortfolioArtwork({project,detail=false}) {
  const [failed,setFailed]=useState({})
  const isApp=project.link?.includes('play.google.com/store/apps/')
  const screens=project.preview?.screens||[]
  const desktop=project.preview?.desktop||(!isApp?project.image:null)
  const validDesktop=desktop&&!failed[desktop]
  const fail=source=>setFailed(old=>({...old,[source]:true}))
  return <div className={`portfolio-art product-stage theme-${project.theme||'ice'} ${isApp?'mobile-stage':'desktop-stage'} ${detail?'detail-art':''}`}>
    <span className="stage-halo" aria-hidden="true"/>
    <div className="stage-caption"><span>{isApp?'ANDROID EXPERIENCE':project.category==='Business software'?'BUSINESS SOFTWARE':'WEB EXPERIENCE'}</span><Icon name={isApp?'phone':'code'} size={16}/></div>
    {isApp?<div className="device-composition"><div className="device-shadow"/>{screens[1]&&!failed[screens[1]]&&<div className="product-phone phone-echo"><span className="device-speaker"/><img src={screens[1]} alt="Second official application screen" loading="lazy" onError={()=>fail(screens[1])}/></div>}<div className="product-phone phone-main"><span className="device-speaker"/>{screens[0]&&!failed[screens[0]]?<img src={screens[0]} alt="Official application screen from Google Play" loading="lazy" onError={()=>fail(screens[0])}/>:<div className="app-icon-screen">{project.image&&!failed[project.image]?<img src={project.image} alt="Official application icon" loading="lazy" onError={()=>fail(project.image)}/>:<Icon name="phone" size={48}/>}<span>ANDROID APPLICATION</span></div>}</div></div>:<div className="product-browser"><div className="browser-toolbar"><div><i/><i/><i/></div><span><Icon name="shield" size={9}/> Product experience</span><Icon name="diagonal" size={11}/></div><div className="browser-viewport">{validDesktop?<img src={desktop} alt="Public website or sign-in page preview" loading="lazy" onError={()=>fail(desktop)}/>:<InterfaceStudy project={project}/>}</div></div>}
    <div className="stage-bottom"><span>{isApp?(screens.length?'ACTUAL APP SCREENS':'OFFICIAL APP ICON'):validDesktop?'PUBLIC PAGE PREVIEW':'ILLUSTRATIVE INTERFACE STUDY'}</span><span>{isApp?'MOBILE':project.category==='Business software'?'WORKSPACE':'RESPONSIVE WEB'} <Icon name="diagonal" size={11}/></span></div>
  </div>
}
