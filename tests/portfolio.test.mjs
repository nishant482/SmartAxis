import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { portfolio,mergePortfolio,publishedApps } from '../src/data/portfolio.js'
import { createApp } from '../server/app.mjs'

test('curated projects stay available and published admin records can update them',()=>{
  const updated={id:'0123456789abcdef01234567',title:'VBike',description:'Updated project information',link:'https://vbike.in/',category:'Web platforms',order:0}
  const merged=mergePortfolio([updated])
  assert.equal(merged.filter(project=>project.title==='VBike').length,1)
  assert.equal(merged.find(project=>project.title==='VBike').id,updated.id)
  assert.ok(merged.some(project=>project.id==='sanatan-wallpaper'))
  assert.equal(new Set(portfolio.map(project=>project.id)).size,portfolio.length)
  assert.ok(publishedApps.every(app=>app.link.startsWith('https://play.google.com/store/apps/details?id=')))
  assert.ok(portfolio.every(project=>!project.link||!(/\/admin|\/backend|select-role/.test(project.link))))
})

test('portfolio-only startup serves projects and rejects unsaved contact/admin writes',async()=>{
  let databaseCalls=0
  const app=createApp({getDb:async()=>{databaseCalls++;throw new Error('Unexpected database call')},uploadDir:path.resolve('server/uploads'),origins:[],curatedProjects:portfolio,databaseConfigured:false})
  const server=await new Promise(resolve=>{const instance=app.listen(0,'127.0.0.1',()=>resolve(instance))})
  const base=`http://127.0.0.1:${server.address().port}`
  try{
    const health=await (await fetch(base+'/api/health')).json()
    assert.equal(health.contactEnabled,false)
    const response=await fetch(base+'/api/projects')
    assert.equal(response.status,200)
    assert.equal((await response.json()).projects.length,portfolio.length)
    assert.equal((await (await fetch(base+'/api/projects/vbike')).json()).project.title,'VBike')
    assert.equal((await fetch(base+'/api/projects/missing')).status,404)
    const contact=await fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'SmartAxis'},body:JSON.stringify({name:'Test visitor'})})
    assert.equal(contact.status,503)
    assert.match((await contact.json()).error,/No message has been saved/)
    assert.equal((await fetch(base+'/api/admin/session')).status,503)
    assert.match(await (await fetch(base+'/sitemap-projects.xml')).text(),/portfolio\/vbike/)
    assert.equal(databaseCalls,0)
  }finally{await new Promise(resolve=>server.close(resolve))}
})
