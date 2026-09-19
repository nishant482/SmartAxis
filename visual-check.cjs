const {chromium}=require('C:/Users/DELL/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5173');await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'desktop-preview.png'});await page.screenshot({path:'home-full-preview.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'mobile-preview.png',fullPage:true});
  await page.goto('http://127.0.0.1:5173/contact');await page.locator('h1').waitFor();await page.screenshot({path:'contact-mobile-preview.png',fullPage:true});
  await browser.close();console.log('Updated public-page screenshots.');
})().catch(error=>{console.error(error);process.exit(1)});
