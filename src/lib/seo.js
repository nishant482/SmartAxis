import { services } from '../data/site.js'

export const siteUrl = 'https://smart-axis.vercel.app'
export const pageMetadata = {
  '/': ['Website & App Development for Businesses in India | SmartAxis', 'SmartAxis builds websites, mobile apps, e-commerce stores and custom software for businesses in India. Explore our UI/UX design and development services.'],
  '/services': ['Web & App Development Services in India | SmartAxis', 'Explore SmartAxis services for businesses in India: websites, mobile apps, UI/UX design, e-commerce, SaaS, custom software and API integrations.'],
  '/solutions': ['Digital Solutions for Your Business | SmartAxis', 'Discover web, mobile and software solutions from SmartAxis, designed around your business workflows, customers and growth plans.'],
  '/portfolio': ['Web, App & Design Projects | SmartAxis Portfolio', 'Explore published SmartAxis projects, from websites and online stores to mobile apps and product design. View project details and live links.'],
  '/about': ['About SmartAxis | Design & Software Development Studio', 'Meet SmartAxis, an independent digital studio combining product strategy, UI/UX design and engineering to build websites, apps and software.'],
  '/process': ['Our Design & Development Process | SmartAxis', 'See how SmartAxis takes your project from discovery and design through development, testing, launch and ongoing support.'],
  '/contact': ['Contact SmartAxis | Discuss Your Website or App Project', 'Tell SmartAxis about your website, mobile app, e-commerce or software project. Share your goals and requirements through our project inquiry form.'],
  '/privacy': ['Privacy Policy | SmartAxis', 'Learn how SmartAxis handles project inquiries, portfolio images and administrator sessions.'],
  '/terms': ['Website Terms | SmartAxis', 'Read the terms for using the SmartAxis website, portfolio and project inquiry form.'],
}
for (const service of services) pageMetadata[`/services/${service.slug}`] = [`${service.title} Services in India | SmartAxis`, service.detail]

export function metadataFor(path) {
  const info = pageMetadata[path]
  if(/^\/portfolio\/[a-f\d]{24}$/i.test(path))return {title:'Project Details | SmartAxis',description:'Explore this SmartAxis project, its design and development details, and the live project link.',canonical:siteUrl+path,noindex:false}
  return {title: info?.[0] || (path.startsWith('/admin') ? 'Admin | SmartAxis' : 'Page not found | SmartAxis'), description:info?.[1] || 'SmartAxis website.', canonical:siteUrl+(path==='/'?'':path), noindex:!info}
}
export function structuredData(path, metadata) {
  const organization = {'@type':'Organization','@id':`${siteUrl}/#organization`,name:'SmartAxis',url:siteUrl,logo:`${siteUrl}/favicon.svg`}
  const graph = [organization, {'@type':'WebSite','@id':`${siteUrl}/#website`,name:'SmartAxis',url:siteUrl,publisher:{'@id':organization['@id']}}, {'@type':'WebPage','@id':`${metadata.canonical}#page`,url:metadata.canonical,name:metadata.title,description:metadata.description,isPartOf:{'@id':`${siteUrl}/#website`}}]
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
  for(const [key,value] of Object.entries({title:metadata.title,description:metadata.description,url:metadata.canonical,type:'website',site_name:'SmartAxis',image:`${siteUrl}/social-card.png`}))set(`meta[property="og:${key}"]`,{property:`og:${key}`,content:value})
  for(const [key,value] of Object.entries({card:'summary_large_image',title:metadata.title,description:metadata.description,image:`${siteUrl}/social-card.png`}))set(`meta[name="twitter:${key}"]`,{name:`twitter:${key}`,content:value})
  let schema=document.getElementById('structured-data')
  if(!schema){schema=document.createElement('script');schema.id='structured-data';schema.type='application/ld+json';document.head.appendChild(schema)}
  schema.textContent=JSON.stringify(structuredData(path,metadata))
}
