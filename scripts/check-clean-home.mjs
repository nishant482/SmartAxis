import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createApp } from '../server/app.mjs'
const app=createApp({getDb:async()=>{throw new Error('not configured')},databaseConfigured:false,uploadDir:path.resolve('server/uploads'),origins:[],distDir:path.resolve('dist')})
const server=await new Promise(r=>{const s=app.listen(0,'127.0.0.1',()=>r(s))})
const base=`http://127.0.0.1:${server.address().port}`
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-gpu']})
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await mkdir('qa',{recursive:true})
try{
for(const width of [1440,768,390,320]){
await page.setViewportSize({width,height:900});
for(const route of ['/','/websites','/apps','/apps/sanatan-wallpapers','/services','/services/web-development','/about','/contact','/blogs','/privacy','/solutions']){
await page.goto(base+route);await page.locator('h1').waitFor();
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right]).slice(0,15)));
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow ${width}`)
assert.equal(await page.locator('h1').count(),1)
assert.equal(await page.locator('.light-site').count(),1)
assert.equal(await page.locator('.light-site').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(250, 250, 247)')
assert.equal(await page.locator('.footer-wordmark').count(),0)
assert.ok(!/Come online/i.test(await page.locator('body').innerText()))
if(route==='/'){
assert.equal(await page.locator('.app-card').count(),6)
assert.ok(await page.locator('#our-apps').evaluate(e=>e.offsetTop)<await page.locator('#selected-work').evaluate(e=>e.offsetTop))
if(width===390||width===1440)await page.screenshot({path:`qa/home-clean-${width}.png`,fullPage:true})
if(width<=390)assert.equal(await page.locator('.app-directory-grid').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3)
}
if(width===390&&['/apps','/contact','/services','/about','/solutions'].includes(route))await page.screenshot({path:'qa/daylight-'+route.slice(1)+'.png',fullPage:true});
if(route==='/websites')assert.equal(await page.locator('.app-card').count(),0)
if(route==='/apps')assert.equal(await page.locator('.app-card').count(),25)
if(route==='/apps/sanatan-wallpapers')assert.equal(await page.locator('a[href*="details?id=com.sanatan.hindu.wallpapers"]').count(),1)
}
}
assert.deepEqual(errors,[])
const legacy=await fetch(base+'/portfolio',{redirect:'manual'});assert.equal(legacy.status,301);assert.equal(legacy.headers.get('location'),'/websites')
console.log('Desktop/mobile layouts, homepage order, 3 apps per mobile row, website-only collection, 25 app links, Sanatan landing page and legacy redirect passed.')
}finally{await browser.close();await new Promise(r=>server.close(r))}
