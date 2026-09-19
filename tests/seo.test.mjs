import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createApp } from '../server/app.mjs'
import { pageMetadata, siteUrl } from '../src/lib/seo.js'

test('prerendered routes, metadata, sitemap and crawler responses', async()=>{
  const db={collection:()=>({find:filter=>{
    assert.equal(filter.published,true)
    return {sort:()=>({limit:()=>({toArray:async()=>[{_id:'0123456789abcdef01234567'}]})})}
  }})}
  const app=createApp({getDb:async()=>db,uploadDir:path.resolve('server/uploads'),origins:[],distDir:path.resolve('dist')})
  const server=await new Promise(resolve=>{const instance=app.listen(0,'127.0.0.1',()=>resolve(instance))})
  const base=`http://127.0.0.1:${server.address().port}`
  try {
    const titles=new Set()
    for(const route of Object.keys(pageMetadata)) {
      const response=await fetch(base+route),html=await response.text()
      assert.equal(response.status,200,route)
      assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route)
      assert.equal((html.match(/rel="canonical"/g)||[]).length,1,route)
      assert.ok(html.includes(`href="${siteUrl}${route==='/'?'':route}"`),route)
      assert.ok(html.includes('application/ld+json'),route)
      assert.ok(!html.includes('googletagmanager.com'), 'Analytics is still unpublished')
      titles.add(html.match(/<title>(.*?)<\/title>/s)[1])
    }
    assert.equal(titles.size,Object.keys(pageMetadata).length)
    const admin=await fetch(base+'/admin/projects')
    assert.equal(admin.status,200)
    assert.equal(admin.headers.get('x-robots-tag'),'noindex, nofollow')
    assert.equal((await fetch(base+'/not-a-real-page')).status,404)
    assert.equal((await fetch(base+'/services/not-a-service')).status,404)
    assert.ok((await (await fetch(base+'/sitemap-projects.xml')).text()).includes('0123456789abcdef01234567'))
    assert.ok((await readFile('dist/sitemap-pages.xml','utf8')).includes('/services/web-development'))
    assert.equal((await fetch(base+'/social-card.png')).status,200)
  } finally { await new Promise(resolve=>server.close(resolve)) }
})
