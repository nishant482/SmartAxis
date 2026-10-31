import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { catalogueApps,publishedApps,testingApps,ownedProjects } from '../src/data/portfolio.js'
import { appCategory,blogCategoryDefaults } from '../src/data/content-categories.js'
await mkdir('qa',{recursive:true})
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-gpu']})
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
const apps=[...catalogueApps,...ownedProjects.filter(app=>app.link?.includes('play.google.com/'))];
const errors=[];page.on('pageerror',error=>errors.push(error.message))
const posts=[]
const categories=()=>[...new Set([...blogCategoryDefaults,...posts.map(post=>post.category)])]
await page.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname,method=req.method()
  const send=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)})
  if(path==='/api/admin/session')return send({username:'qa-editor'})
  if(path==='/api/health')return send({status:'ok',database:'not configured',contactEnabled:false})
  if(path==='/api/projects')return send({projects:[]})
  if(path==='/api/admin/blogs'&&method==='GET')return send({posts:posts.filter(post=>(!url.searchParams.get('status')||(url.searchParams.get('status')==='published')===post.published)&&(!url.searchParams.get('category')||url.searchParams.get('category')===post.category)),categories:categories(),total:posts.length,page:1,pages:1})
  if(path.startsWith('/api/admin/blogs')&&['POST','PUT'].includes(method)){
    const form=await new Request('http://fixture.invalid',{method:'POST',headers:{'content-type':req.headers()['content-type']},body:req.postDataBuffer()}).formData()
    const value=Object.fromEntries([...form.entries()].filter(([key])=>key!=='image'));value.published=value.published==='true';value.publishedAt=value.published?new Date().toISOString():null
    const id=path.split('/').pop()
    if(method==='PUT')Object.assign(posts.find(post=>post.id===id),value)
    else posts.push({...value,id:'0123456789abcdef01234567'})
    return send({id:'0123456789abcdef01234567',message:value.published?'Article published.':'Draft saved.'},method==='POST'?201:200)
  }
  if(path.startsWith('/api/admin/blogs/')&&method==='DELETE'){posts.splice(posts.findIndex(post=>post.id===path.split('/').pop()),1);return send({ok:true})}
  if(path==='/api/blogs'){
    const visible=posts.filter(post=>post.published&&(!url.searchParams.get('category')||post.category===url.searchParams.get('category')))
    return send({posts:visible,categories:categories(),total:visible.length,page:1,pages:1})
  }
  if(path.startsWith('/api/blogs/')){const post=posts.find(post=>post.slug===path.split('/').pop()&&post.published);return post?send({post}):send({error:'Article not found.'},404)}
  return send({error:'Fixture endpoint not found.'},404)
})
async function noOverflow(route,width){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:5173'+route);await page.locator('h1').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflows at ${width}px`);assert.equal(await page.locator('a[href="/process"]').count(),0);assert.ok(!/[\u2190-\u2199]/.test(await page.locator('body').innerText()))}
try{
  for(const width of [1440,768,390,320]){
    for(const path of ['/','/apps','/blogs','/admin/blogs'])await noOverflow(path,width)
    console.log(`New pages pass at ${width}px`)
  }
  await page.goto('http://127.0.0.1:5173/apps')
  assert.equal(await page.locator('.app-card').count(),apps.length)
  for(const [label,id] of [['Sanatan Bhakti & Devotional','sanatan'],['Games','games'],['Study Material','study']]){
    await page.getByRole('button',{name:label,exact:true}).click()
    assert.equal(await page.locator('.app-card').count(),catalogueApps.filter(app=>appCategory(app)===id).length)
  }
  await page.getByRole('button',{name:'Games',exact:true}).click()
  assert.equal(await page.locator('.app-testing').count(),4)
  for(const app of testingApps)assert.equal(await page.locator(`.app-testing[href="${app.link}"]`).count(),1)
  const cards=page.locator('.app-card'),rows=await cards.evaluateAll(items=>items.slice(0,4).map(item=>item.getBoundingClientRect().y))
  assert.equal(rows[0],rows[1]);assert.equal(rows[1],rows[2]);assert.ok(rows[3]>rows[0])
  await page.route('https://play.google.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'Testing listing opened'}))
  await page.locator(`a[href="${testingApps[0].link}"]`).click();await page.waitForURL(testingApps[0].link)
  await page.goto('http://127.0.0.1:5173/admin/blogs')
  await page.getByRole('button',{name:'Add article',exact:true}).click()
  await page.getByLabel('Article title',{exact:true}).fill('Browser fixture learning guide')
  await page.getByLabel('Category',{exact:true}).fill('Study Material')
  await page.getByLabel('Short excerpt',{exact:true}).fill('A useful excerpt written only for the browser test.')
  await page.getByLabel('Article content',{exact:true}).fill('A useful article paragraph for the isolated browser fixture.\n\n<img src=x onerror="window.injected=true">')
  await page.getByRole('button',{name:'Preview article',exact:true}).click()
  assert.ok((await page.locator('.blog-editor-preview').innerText()).includes('<img src=x'))
  assert.equal(await page.locator('.blog-editor-preview .article-body img').count(),0)
  await page.getByRole('button',{name:'Save draft',exact:true}).click()
  await page.getByRole('status').filter({hasText:'Draft saved.'}).waitFor()
  assert.equal(posts.length,1);assert.equal(posts[0].published,false)
  await page.goto('http://127.0.0.1:5173/blogs')
  assert.equal(await page.locator('.blog-card').count(),0)
  await page.goto('http://127.0.0.1:5173/admin/blogs')
  await page.getByRole('button',{name:'Edit article',exact:true}).click()
  await page.getByLabel('Visibility',{exact:true}).selectOption('true')
  await page.getByRole('button',{name:'Publish article',exact:true}).click()
  await page.getByRole('status').filter({hasText:'Article published.'}).waitFor()
  await page.goto('http://127.0.0.1:5173/blogs')
  await page.getByRole('button',{name:'Study Material',exact:true}).click()
  await page.getByRole('heading',{name:'Browser fixture learning guide',exact:true}).waitFor()
  await page.getByRole('link',{name:'Read article',exact:true}).click()
  await page.getByRole('heading',{name:'Browser fixture learning guide',exact:true}).waitFor()
  assert.equal(await page.locator('.article-body img').count(),0)
  assert.equal(await page.evaluate(()=>window.injected),undefined)
  await page.goto('http://127.0.0.1:5173/admin/blogs')
  page.once('dialog',dialog=>dialog.accept())
  await page.getByRole('button',{name:'Delete',exact:true}).click()
  await page.getByRole('status').filter({hasText:'Article deleted.'}).waitFor()
  assert.equal(posts.length,0)
  await page.goto('http://127.0.0.1:5173/apps')
  await page.locator('.app-card img').evaluateAll(images=>images.forEach(image=>image.loading='eager'))
  await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))))
  assert.equal(await page.locator('.app-card img').evaluateAll(images=>images.filter(image=>!image.naturalWidth).length),0)
  await page.screenshot({path:'qa/apps-categories-mobile.png',fullPage:true})
  await page.goto('http://127.0.0.1:5173/blogs');await page.screenshot({path:'qa/blogs-mobile.png',fullPage:true})
  assert.deepEqual(errors,[])
  console.log(`Passed: ${publishedApps.length} published + ${testingApps.length} testing apps, category filters, mobile rows, testing links, admin create/preview/draft/publish/delete, public visibility and safe text rendering.`)
}finally{await browser.close()}
