export const clarityProjectId=String(import.meta.env?.VITE_CLARITY_PROJECT_ID||'').trim()
export const clarityConfigured=/^[a-z0-9]{6,32}$/i.test(clarityProjectId)
let inserted=false
export function privateAnalyticsPath(path){
 const pathname=String(path).split(/[?#]/)[0].replace(/\/+$/,'').toLowerCase()||'/'
 return pathname==='/admin'||pathname.startsWith('/admin/')||pathname==='/contact'||pathname.startsWith('/contact/')
}
export function clarityAllowed({projectId,production,hostname,path}){
 return Boolean(production&&/^[a-z0-9]{6,32}$/i.test(projectId||'')&&['smartxapp-studio.vercel.app','smart-axis.vercel.app'].includes(hostname)&&!privateAnalyticsPath(path))
}
export function initializeClarity(path,options={}){
 if(typeof window==='undefined'||typeof document==='undefined')return false
 const projectId=options.projectId??clarityProjectId
 if(!clarityAllowed({projectId,production:options.production??Boolean(import.meta.env?.PROD),hostname:window.location.hostname,path}))return false
 if(inserted)return true
 window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)}
 const script=document.createElement('script')
 script.id='microsoft-clarity'
 script.async=true
 script.src='https://www.clarity.ms/tag/'+projectId
 script.onerror=()=>{inserted=false;script.remove()}
 inserted=true
 document.head.appendChild(script)
 return true
}
// A fresh document prevents a public-page recorder from observing private forms.
export function clarityNeedsDocument(path){return inserted&&privateAnalyticsPath(path)}
