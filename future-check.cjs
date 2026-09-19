const { chromium } = require('C:/Users/DELL/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport:{width:1440,height:1000} });
  const errors=[];
  const fixtureProjects=['Finova','ShopSphere','MedixPro','WorkFlowX'].map((title,index)=>({id:String(index+1).padStart(24,'0'),title,description:'A browser fixture for checking the project preview layout.',category:'Web platforms',link:'https://example.com',image:'/src/assets/axis-sculpture.webp',featured:true,order:index}));
  await page.route('**/api/projects',route=>route.fulfill({json:{projects:fixtureProjects}}));
  await page.route('**/api/projects/*',route=>route.fulfill({json:{project:fixtureProjects.find(project=>route.request().url().endsWith(project.id))}}));
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(() => {
    window.heroDraws=0;
    const draw=WebGLRenderingContext.prototype.drawElements;
    WebGLRenderingContext.prototype.drawElements=function(...args){window.heroDraws++;return draw.apply(this,args)};
  });
  await page.goto('http://127.0.0.1:5173');
  await page.locator('canvas.hero-sculpture').waitFor();
  await page.waitForFunction(()=>window.heroDraws>3);
  await page.getByRole('button',{name:'Pause hero animation'}).click();
  await page.waitForTimeout(150);
  const paused=await page.evaluate(()=>window.heroDraws);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>window.heroDraws),paused,'Paused animation stays still');
  await page.getByRole('button',{name:'Play hero animation'}).click();
  await page.waitForFunction(previous=>window.heroDraws>previous+3,paused);
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const hidden=await page.evaluate(()=>window.heroDraws);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>window.heroDraws),hidden,'Offscreen animation stops');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(200);
  const reduced=await page.evaluate(()=>window.heroDraws);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>window.heroDraws),reduced,'Reduced-motion scene stays still');
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    for(const name of ['Finova','ShopSphere','MedixPro','WorkFlowX']){
      await page.getByRole('tab',{name:new RegExp(name,'i')}).click();
      await page.locator('#work-preview h3').filter({hasText:name}).waitFor();
      assert.equal(await page.locator('#work-preview').getAttribute('aria-labelledby'),await page.getByRole('tab',{name:new RegExp(name,'i')}).getAttribute('id'));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} overflows at ${width}`);
    }
    await page.getByRole('tab',{name:/WorkFlowX/i}).press('Home');
    assert.equal(await page.getByRole('tab',{name:/Finova/i}).getAttribute('aria-selected'),'true');
    await page.getByRole('tab',{name:/Finova/i}).press('ArrowRight');
    assert.equal(await page.getByRole('tab',{name:/ShopSphere/i}).getAttribute('aria-selected'),'true');
  }
  await page.locator('#work-preview').getByRole('link',{name:'Inside the project'}).click();
  await page.waitForURL('**/portfolio/000000000000000000000002');
  assert.deepEqual(errors,[]);
  const fallback=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await fallback.addInitScript(()=>{const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:getContext.call(this,type,...args)}});
  await fallback.goto('http://127.0.0.1:5173');
  await fallback.locator('.sculpture-fallback').waitFor();
  await fallback.locator('.sculpture-fallback').evaluate(image=>image.decode());
  assert.equal(await fallback.locator('h1').count(),1);
  await fallback.screenshot({path:'future-fallback.png'});
  console.log('PASS: live WebGL, pause/resume, offscreen suspension, reduced motion, static fallback, all project tabs at four widths, keyboard controls, and project navigation.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
