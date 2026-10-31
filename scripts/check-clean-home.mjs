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
await page.route('**/api/blogs/banner-preview',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({post:{slug:'banner-preview',title:'A thoughtful guide to finding your everyday inspiration',category:'Studio Updates',excerpt:'A short preview to check that article banners remain readable on every screen.',content:'This article exists only in the isolated browser test.',publishedAt:'2026-10-31T10:00:00Z'}})}))
try{
for(const width of [1440,1024,768,430,390,375,320]){
await page.setViewportSize({width,height:900});
for(const route of ['/','/websites','/apps','/apps/sanatan-wallpapers','/services','/services/web-development','/about','/contact','/blogs','/privacy','/terms','/solutions','/portfolio/vbike','/portfolio/sanatan-wallpaper','/blogs/banner-preview']){
await page.goto(base+route);await page.locator('h1').waitFor();
if(route==='/blogs/banner-preview')await page.getByRole('heading',{name:'A thoughtful guide to finding your everyday inspiration',exact:true}).waitFor();
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right]).slice(0,15)));
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow ${width}`)
assert.equal(await page.locator('h1').count(),1)
assert.equal(await page.locator('.page-banner').count(),1,route+' needs one banner')
const bannerBox=await page.locator('.page-banner').boundingBox();assert.ok(Math.abs(bannerBox.x)<1&&Math.abs(bannerBox.width-width)<1,route+' banner must be edge-to-edge')
assert.equal(await page.locator('.page-banner').evaluate(e=>getComputedStyle(e).borderRadius),'0px')
assert.ok((await page.locator('.page-banner').boundingBox()).height<520,route+' banner should fit readable text without excessive height')
assert.equal(await page.locator('.light-site').count(),1)
assert.equal(await page.locator('.light-site').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(250, 250, 247)')
assert.equal(await page.locator('.footer-wordmark').count(),0)
assert.ok(!/Come online/i.test(await page.locator('body').innerText()))
if(route==='/'){
assert.equal(await page.locator('.app-card').count(),6)
assert.ok(await page.locator('#our-apps').evaluate(e=>e.offsetTop)<await page.locator('#selected-work').evaluate(e=>e.offsetTop))
if(width===390||width===1440)await page.screenshot({path:`qa/home-clean-${width}.png`,fullPage:true})
if(width===390)assert.ok(await page.locator('#our-apps').evaluate(e=>e.offsetTop)<800,'Apps should follow the compact hero promptly');
if(width<=390)assert.equal(await page.locator('.app-directory-grid').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3)
}
if(width===390&&['/apps','/contact','/services','/about','/solutions'].includes(route))await page.screenshot({path:'qa/daylight-'+route.slice(1)+'.png',fullPage:true});
if(route==='/'&&width<=768){
 const toggle=page.getByRole('button',{name:'Open menu'});assert.ok((await toggle.boundingBox()).height>=44)
 await toggle.click();assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).overflow),'hidden')
 await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false')
 await toggle.click();await page.locator('#main-navigation').getByRole('link',{name:'Websites',exact:true}).click()
 assert.equal(new URL(page.url()).pathname,'/websites');assert.equal(await page.locator('.nav-links.is-open').count(),0)
 assert.ok(await page.locator('body').evaluate(e=>getComputedStyle(e).overflow)!=='hidden')
}
if(route==='/websites')assert.equal(await page.locator('.app-card').count(),0)
if(route==='/apps')assert.equal(await page.locator('.app-card').count(),25)
if(route==='/apps/sanatan-wallpapers')assert.equal(await page.locator('a[href*="details?id=com.sanatan.hindu.wallpapers"]').count(),1)
}
}
assert.deepEqual(errors,[])
const legacy=await fetch(base+'/portfolio',{redirect:'manual'});assert.equal(legacy.status,301);assert.equal(legacy.headers.get('location'),'/websites')
console.log('Desktop/mobile layouts, homepage order, 3 apps per mobile row, website-only collection, 25 app links, Sanatan landing page and legacy redirect passed.')
}finally{await browser.close();await new Promise(r=>server.close(r))}
