import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clarityAllowed,privateAnalyticsPath,initializeClarity,clarityNeedsDocument,clarityProjectId } from '../src/lib/clarity.js'
test('Clarity requires a real project and production public route',()=>{
 const base={projectId:'abc123xyz9',production:true,hostname:'smartxapp-studio.vercel.app',path:'/apps/sanatan-bhakti'}
 assert.equal(clarityAllowed(base),true)
 for(const patch of [{projectId:''},{projectId:'https://clarity.ms'},{production:false},{hostname:'localhost'},{hostname:'preview.vercel.app'},{path:'/admin'},{path:'/admin/blogs'},{path:'/contact'},{path:'/CONTACT/'},{path:'/contact?source=nav'}])assert.equal(clarityAllowed({...base,...patch}),false)
 assert.equal(privateAnalyticsPath('/apps/contact-learning'),false)
 assert.equal(initializeClarity('/'),false)
 assert.equal(clarityNeedsDocument('/contact'),false)
 assert.equal(clarityProjectId,'')
})
test('one async loader, guarded private navigation and retry after load failure',()=>{
 const nodes=[]
 globalThis.window={location:{hostname:'smartxapp-studio.vercel.app'}}
 globalThis.document={createElement:()=>({remove(){this.removed=true}}),head:{appendChild:node=>nodes.push(node)}}
 try{
 const config={projectId:'abc123xyz9',production:true}
 assert.equal(initializeClarity('/contact',config),false)
 assert.equal(initializeClarity('/apps',config),true)
 assert.equal(initializeClarity('/websites',config),true)
 assert.equal(nodes.length,1)
 assert.equal(nodes[0].src,'https://www.clarity.ms/tag/abc123xyz9')
 assert.equal(nodes[0].async,true)
 assert.equal(clarityNeedsDocument('/admin/blogs'),true)
 assert.equal(clarityNeedsDocument('/contact'),true)
 assert.equal(clarityNeedsDocument('/apps'),false)
 nodes[0].onerror();assert.equal(nodes[0].removed,true)
 assert.equal(clarityNeedsDocument('/contact'),false)
 assert.equal(initializeClarity('/apps',config),true)
 assert.equal(nodes.length,2)
 nodes[1].onerror()
 }finally{delete globalThis.window;delete globalThis.document}
})
