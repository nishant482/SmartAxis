import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import path from 'node:path'
import { createApp } from '../server/app.mjs'
import { devotionalPages,bhaktiStoreUrl } from '../src/data/devotional.js'
const app=createApp({getDb:async()=>{throw new Error('offline')},databaseConfigured:false,uploadDir:path.resolve('server/uploads'),origins:[],distDir:path.resolve('dist')})
const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s))})
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-gpu']})
try{
const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message))
for(const width of [1440,768,390,320]){
 await page.setViewportSize({width,height:900})
 for(const route of [...devotionalPages.map(p=>p.path),'/apps/games','/apps','/']){
  await page.goto(`http://127.0.0.1:${server.address().port}`+route,{waitUntil:'domcontentloaded'})
  await page.locator('h1').waitFor();assert.equal(await page.locator('h1').count(),1)
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflow at '+width)
  if(route.includes('sanatan-bhakti')){
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://smartxapp-studio.vercel.app'+route)
   assert.equal(await page.locator('.banner-actions a').first().getAttribute('href'),bhaktiStoreUrl)
   assert.equal(await page.locator('.guide-screens img').count(),4)
   await page.locator('details').first().locator('summary').click();assert.ok(await page.locator('details').first().getAttribute('open')!==null)
   if(width===390&&route==='/apps/sanatan-bhakti')await page.screenshot({path:'qa/sanatan-bhakti-mobile.png',fullPage:true})
  }
  if(route==='/apps/games'){assert.equal(await page.locator('.app-card').count(),9);assert.equal(await page.locator('.app-testing').count(),4)}
  if(route==='/apps')assert.equal(await page.locator('.app-card').count(),26)
 }
}
assert.deepEqual(errors,[])
console.log('Devotional topics, canonicals, store links, FAQ controls, 26 apps and 9 games passed on mobile/tablet/desktop with no runtime errors.')
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
