import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir,writeFile } from 'node:fs/promises'
import { portfolio } from '../src/data/portfolio.js'
import { previews as saved } from '../src/data/previews.js'
const previews={...saved}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-gpu']})
const websiteSources={vbike:'https://vbike.in/',rajothreads:'https://rajothreads.com/',halox:'https://haloxsmart.com/',bmtindiatech:'https://bmtindiatech.com/',thlsemi:'https://thlsemi.com/','vbike-hrms':'https://hr.vbike.in/','vbike-dms':'https://vbike.in/dms/select-role','rajothreads-admin':'https://rajothreads.com/admin','vbike-backend':'https://vbike.in/backend'}
await mkdir('public/portfolio/screens',{recursive:true})
await mkdir('public/portfolio/projects',{recursive:true})
try{
  for(const [id,url] of Object.entries(process.argv[2]==='apps'?{}:websiteSources)){
    const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'})
    try{
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:18000})
      if(!response?.ok())throw new Error(`HTTP ${response?.status()}`)
      await page.waitForTimeout(2200)
      await page.keyboard.press('Escape')
      const close=page.getByRole('button',{name:/^(close|dismiss|×|✕|x)$/i}).first()
      if(await close.isVisible().catch(()=>false))await close.click({force:true,timeout:1000}).catch(()=>{})
      await page.locator('img').evaluateAll(images=>images.forEach(image=>image.loading='eager'))
      await page.evaluate(()=>Promise.race([Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,2500))]))
      if(id==='rajothreads'){
        const category=page.getByRole('heading',{name:'Shop by category',exact:true})
        if(await category.count())await category.scrollIntoViewIfNeeded()
      }
      const text=(await page.locator('body').innerText()).trim()
      if(text.length<60||/access denied|verify you are human|checking your browser|403 forbidden/i.test(text.slice(0,500)))throw new Error('Preview unavailable')
      await sharp(await page.screenshot()).resize(1440,960).webp({quality:88}).toFile(`public/portfolio/projects/${id}.webp`)
      previews[id]={desktop:`/portfolio/projects/${id}.webp`,source:url}
      console.log(`Website preview saved: ${id}`)
    }catch(error){console.log(`Website preview unavailable: ${id} (${error.message.split('\n')[0]})`)}
    finally{await page.close()}
  }
  for(const project of portfolio.filter(project=>project.link?.includes('play.google.com/store/apps/details'))){
    if(previews[project.id]?.screens?.length)continue
    try{
      const response=await fetch(project.link,{signal:AbortSignal.timeout(15000)})
      if(!response.ok)throw new Error(`Store HTTP ${response.status}`)
      const html=await response.text()
      const tags=html.match(/<img\b[^>]*>/g)||[]
      const urls=[...new Set(tags.filter(tag=>/alt="Screenshot image"/.test(tag)).map(tag=>tag.match(/\bsrc="([^"]+)"/)?.[1]).filter(url=>url?.startsWith('https://play-lh.googleusercontent.com/')))].slice(0,2)
      if(!urls.length)throw new Error('No public screenshots')
      const screens=[]
      for(const [index,url] of urls.entries()){
        const result=await fetch(url.replaceAll('&amp;','&'),{signal:AbortSignal.timeout(15000)})
        if(!result.ok)continue
        const file=`${project.id}-${index}.webp`
        await sharp(Buffer.from(await result.arrayBuffer())).resize({width:600,withoutEnlargement:true}).webp({quality:87}).toFile(`public/portfolio/screens/${file}`)
        screens.push(`/portfolio/screens/${file}`)
      }
      if(screens.length)previews[project.id]={...previews[project.id],screens,source:project.link}
      console.log(`App screenshots saved: ${project.id} (${screens.length})`)
    }catch(error){console.log(`App screenshots unavailable: ${project.id} (${error.message})`)}
  }
}finally{
  await browser.close()
  await writeFile('src/data/previews.js',`// Public source previews. No authenticated pages or user data.\nexport const previews = ${JSON.stringify(previews,null,2)}\n`)
}
