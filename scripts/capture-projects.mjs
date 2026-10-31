import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'
import { ownedProjects } from '../src/data/portfolio.js'
await mkdir('public/portfolio/projects',{recursive:true})
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
await Promise.all(ownedProjects.filter(project=>project.image?.includes('/projects/')&&(!process.argv[2]||project.id===process.argv[2])).map(async project=>{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'})
  try{
    const response=await page.goto(project.link,{waitUntil:'domcontentloaded',timeout:30000})
    if(!response?.ok())throw new Error(`HTTP ${response?.status()}`)
    await page.waitForTimeout(2500)
    await page.keyboard.press('Escape')
    const close=page.getByRole('button',{name:/^(close|dismiss|×|✕|✖|x)$/i}).first()
    if(await close.isVisible().catch(()=>false))await close.click({timeout:1500,force:true}).catch(()=>{})
    if(project.id==='vbike')await page.waitForTimeout(5500)
    await page.locator('img').evaluateAll(images=>images.forEach(image=>image.loading='eager'))
    await page.evaluate(()=>Promise.race([Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,5000))]))
    const text=await page.locator('body').innerText()
    if(text.length<80||/verify you are human|access denied|checking your browser/i.test(text.slice(0,500)))throw new Error('Public preview unavailable')
    await sharp(await page.screenshot()).resize(1200,833).webp({quality:84}).toFile(`public/portfolio/projects/${project.id}.webp`)
    console.log(`Captured public website: ${project.id}`)
  }catch(error){console.log(`Identity fallback: ${project.id} (${error.message})`)}
  finally{await page.close()}
}))
const page=await browser.newPage()
for(const url of []){
  try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});console.log(JSON.stringify({url,title:await page.title(),apps:await page.locator('a[href*="/store/apps/details?id="]').evaluateAll(links=>links.slice(0,8).map(link=>({name:link.innerText,url:link.href})))}))}catch(error){console.log(`Store lookup unavailable: ${error.message}`)}
}
await browser.close()
