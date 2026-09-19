import { useEffect, useState } from 'react'
export async function api(url, options = {}) {
  let response
  const headers = { 'X-Requested-With':'SmartAxis', ...options.headers }
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type']='application/json'
  try { response=await fetch(url,{credentials:'same-origin',...options,headers}) }
  catch(error) { if (error.name==='AbortError') throw error; throw new Error('Cannot reach the server. Check your connection and try again.') }
  const data=await response.json().catch(()=>({error:'The server returned an unexpected response. Please try again.'}))
  if (!response.ok) { const error=new Error(data.error||'The request failed.'); error.status=response.status; if(response.status===401 && url.startsWith('/api/admin/') && !url.endsWith('/login') && !url.endsWith('/session'))window.dispatchEvent(new Event('admin-session-expired')); throw error }
  return data
}
export function useResource(url) {
  const [state,setState]=useState({key:'',data:null,loading:true,error:''})
  const [revision,setRevision]=useState(0)
  const key=`${url}:${revision}`
  useEffect(()=>{
    const controller=new AbortController()
    api(url,{signal:controller.signal}).then(data=>setState({key,data,loading:false,error:''})).catch(error=>{if(error.name!=='AbortError')setState({key,data:null,loading:false,error:error.message,status:error.status})})
    return ()=>controller.abort()
  },[url,key])
  return {...(state.key===key?state:{data:null,loading:true,error:''}),reload:()=>setRevision(value=>value+1)}
}
