import { services } from '../data/site.js'
import { portfolio } from '../data/portfolio.js'

export const siteUrl = 'https://smartxapp-studio.vercel.app'
export const pageMetadata = {
  '/': ['Website & App Development for Businesses in India | SmartXApp Studio', 'Come online and grow your business with SmartXApp Studio. We build websites, mobile apps, online stores and software for businesses in India.'],
  '/services': ['Web & App Development Services in India | SmartXApp Studio', 'Explore SmartXApp Studio services for businesses in India: websites, mobile apps, UI/UX design, e-commerce, SaaS, custom software and API integrations.'],
  '/solutions': ['Digital Solutions for Your Business | SmartXApp Studio', 'Discover web, mobile and software solutions from SmartXApp Studio, designed around your business workflows, customers and growth plans.'],
  '/portfolio': ['Projects & Published Android Apps | SmartXApp Studio', 'Explore website experiences, connected mobile apps, business software and Android applications published by SmartXApp Studio on Google Play.'],
  '/about': ['About SmartXApp Studio | Design & Software Development Studio', 'Meet SmartXApp Studio, an independent digital studio combining product strategy, UI/UX design and engineering to build websites, apps and software.'],
  '/process': ['Our Design & Development Process | SmartXApp Studio', 'See how SmartXApp Studio takes your project from discovery and design through development, testing, launch and ongoing support.'],
  '/contact': ['Contact SmartXApp Studio | Discuss Your Website or App Project', 'Tell SmartXApp Studio about your website, mobile app, e-commerce or software project. Share your goals and requirements through our project inquiry form.'],
  '/privacy': ['Privacy Policy | SmartXApp Studio', 'Learn how SmartXApp Studio handles project inquiries, portfolio images and administrator sessions.'],
  '/terms': ['Website Terms | SmartXApp Studio', 'Read the terms for using the SmartXApp Studio website, portfolio and project inquiry form.'],
}
for (const service of services) pageMetadata[`/services/${service.slug}`] = [`${service.title} Services in India | SmartXApp Studio`, service.detail]
for (const project of portfolio) pageMetadata[`/portfolio/${project.id}`] = [`${project.displayTitle||project.title} | SmartXApp Studio Products`,project.summary||project.description]

export function metadataFor(path) {
  const info = pageMetadata[path]
  if(/^\/portfolio\/[a-f\d]{24}$/i.test(path))return {title:'Project Details | SmartXApp Studio',description:'Explore this SmartXApp Studio project, its design and development details, and the live project link.',canonical:siteUrl+path,noindex:false}
  return {title: info?.[0] || (path.startsWith('/admin') ? 'Admin | SmartXApp Studio' : 'Page not found | SmartXApp Studio'), description:info?.[1] || 'SmartXApp Studio website.', canonical:siteUrl+(path==='/'?'':path), noindex:!info}
}
export function structuredData(path, metadata) {
  const organization = {'@type':'Organization','@id':`${siteUrl}/#organization`,name:'SmartXApp Studio',url:siteUrl,logo:`${siteUrl}/favicon.svg`}
  const graph = [organization, {'@type':'WebSite','@id':`${siteUrl}/#website`,name:'SmartXApp Studio',url:siteUrl,publisher:{'@id':organization['@id']}}, {'@type':'WebPage','@id':`${metadata.canonical}#page`,url:metadata.canonical,name:metadata.title,description:metadata.description,isPartOf:{'@id':`${siteUrl}/#website`}}]
  const service=services.find(value=>path===`/services/${value.slug}`)
  if(service)graph.push({'@type':'Service',name:service.title,description:service.detail,url:metadata.canonical,areaServed:{'@type':'Country',name:'India'},provider:{'@id':organization['@id']}})
  return {'@context':'https://schema.org','@graph':graph}
}
export function updateMetadata(path, overrides={}) {
  const metadata={...metadataFor(path),...overrides}
  document.title=metadata.title
  const set=(selector,attributes)=>{
    let element=document.head.querySelector(selector)
    if(!element){element=document.createElement(selector.startsWith('link')?'link':'meta');document.head.appendChild(element)}
    Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,value))
  }
  set('meta[name="description"]',{name:'description',content:metadata.description})
  set('meta[name="robots"]',{name:'robots',content:metadata.noindex?'noindex, follow':'index, follow, max-image-preview:large'})
  set('link[rel="canonical"]',{rel:'canonical',href:metadata.canonical})
  for(const [key,value] of Object.entries({title:metadata.title,description:metadata.description,url:metadata.canonical,type:'website',site_name:'SmartXApp Studio',image:`${siteUrl}/social-card.png`}))set(`meta[property="og:${key}"]`,{property:`og:${key}`,content:value})
  for(const [key,value] of Object.entries({card:'summary_large_image',title:metadata.title,description:metadata.description,image:`${siteUrl}/social-card.png`}))set(`meta[name="twitter:${key}"]`,{name:`twitter:${key}`,content:value})
  let schema=document.getElementById('structured-data')
  if(!schema){schema=document.createElement('script');schema.id='structured-data';schema.type='application/ld+json';document.head.appendChild(schema)}
  schema.textContent=JSON.stringify(structuredData(path,metadata))
}
