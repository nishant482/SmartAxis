const {chromium}=require('C:/Users/DELL/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    for(const route of ['/','/services','/services/web-development','/solutions','/portfolio','/about','/process','/contact','/privacy','/terms','/does-not-exist']){
      await page.goto('http://127.0.0.1:5173'+route);await page.locator('h1').waitFor();
      assert.equal(await page.locator('header').count(),1);
      assert.equal(await page.locator('h1').count(),1);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflows at ${width}`);
    }
  }
  await page.goto('http://127.0.0.1:5173/services');
  await page.getByRole('button',{name:'Design',exact:true}).click();assert.equal(await page.locator('.service-detail-card').count(),1);
  await page.locator('.service-detail-card').click();await page.waitForURL('**/services/ui-ux-design');
  await page.reload();await page.locator('h1').waitFor();await page.goBack();await page.waitForURL('**/services');
  await page.goto('http://127.0.0.1:5173/solutions');await page.getByRole('tab',{name:'Enterprises'}).click();
  await page.getByRole('tab',{name:'Enterprises'}).press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'E-commerce'}).getAttribute('aria-selected'),'true');
  await page.goto('http://127.0.0.1:5173/process');await page.locator('summary').filter({hasText:'How long does a project take?'}).click();assert.equal(await page.locator('details[open]').count(),1);
  await page.getByRole('button',{name:'Open menu'}).click();assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
  await page.keyboard.press('Shift+Tab');assert.equal(await page.getByRole('button',{name:'Close menu'}).evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Open menu'}).getAttribute('aria-expanded'),'false');assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden');
  await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('navigation').getByRole('link',{name:'About',exact:true}).click();await page.waitForURL('**/about');
  assert.equal(await page.getByRole('button',{name:'Open menu'}).getAttribute('aria-expanded'),'false');
  assert.deepEqual(errors,[]);
  console.log('PASS: 11 public routes at four widths, one navbar/h1, history, service filters, keyboard solution tabs, FAQ, mobile menu, focus containment, and Escape.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
