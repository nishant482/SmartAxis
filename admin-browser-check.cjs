const {chromium}=require('C:/Users/DELL/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const {readFileSync}=require('node:fs');
const assert=require('node:assert/strict');
const sharp=require('sharp');

(async()=>{
  const access=readFileSync('.admin-access.local','utf8');
  const username=access.match(/^Username: (.+)$/m)[1],password=access.match(/^Password: (.+)$/m)[1];
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  let projectId,inquiryId;
  const marker=Date.now().toString(),title=`Browser test ${marker}`,name=`Inquiry test ${marker}`;
  async function backend(url,method='GET',body){return page.evaluate(async({url,method,body})=>{const response=await fetch(url,{method,headers:{'X-Requested-With':'SmartAxis','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json()}},{url,method,body})}
  try{
    await page.goto('http://127.0.0.1:5173/');await page.locator('h1').waitFor();
    await page.locator('header').evaluate(header=>{header.dataset.identity='original-header'});
    for(const label of ['Services','Solutions','Our work','About','Process','Home']){
      await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:label,exact:true}).click();
      await page.locator('h1').waitFor();
      assert.equal(await page.locator('header').count(),1);
      assert.equal(await page.locator('header').getAttribute('data-identity'),'original-header','Navigation retains the exact same header element');
    }
    await page.goto('http://127.0.0.1:5173/admin');
    await page.getByRole('heading',{name:'Welcome back.'}).waitFor();
    assert.equal(await page.locator('.site-header').count(),0,'Public navbar is not duplicated in admin');
    await page.getByLabel('Username',{exact:true}).fill(username);await page.getByLabel('Password',{exact:true}).fill(password);
    await page.getByRole('button',{name:'Sign in to your workspace'}).click();
    await page.getByRole('heading',{name:'Good to see you.'}).waitFor();
    await page.locator('.admin-stats').waitFor();
    await page.screenshot({path:'admin-dashboard-preview.png',fullPage:true});
    await page.getByRole('navigation',{name:'Admin navigation'}).getByRole('link',{name:'Projects',exact:true}).click();
    await page.getByRole('button',{name:'Add project'}).click();
    await page.getByLabel('Project title',{exact:true}).fill(title);
    await page.getByLabel('Description',{exact:true}).fill('A browser test verifying local project uploads and database persistence.');
    await page.getByLabel('Live project URL',{exact:true}).fill('https://example.com/smartaxis-test');
    await page.getByLabel('Publish on website').uncheck();
    const image=await sharp({create:{width:960,height:640,channels:3,background:'#314f80'}}).png().toBuffer();
    await page.getByLabel('Project image',{exact:true}).setInputFiles({name:'test-project.png',mimeType:'image/png',buffer:image});
    await page.screenshot({path:'admin-editor-preview.png',fullPage:true});
    await page.getByRole('button',{name:'Create project',exact:true}).click();
    await page.getByText('Project added.',{exact:true}).waitFor();
    const saved=await backend('/api/admin/projects?search='+encodeURIComponent(title));
    projectId=saved.data.projects.find(project=>project.title===title).id;
    assert.ok(!(await backend('/api/projects')).data.projects.some(project=>project.id===projectId));
    const card=page.locator('.admin-project-card').filter({hasText:title});
    await card.getByRole('button',{name:'Edit project'}).click();
    await page.getByLabel('Publish on website').check();await page.getByLabel('Feature on homepage').check();
    await page.getByRole('button',{name:'Save changes'}).click();await page.getByText('Project updated.',{exact:true}).waitFor();
    assert.ok((await backend('/api/projects')).data.projects.some(project=>project.id===projectId));
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:900});
      for(const route of ['/admin','/admin/projects','/admin/inquiries','/admin/account']){
        await page.goto('http://127.0.0.1:5173'+route);await page.locator('.admin-main h1').waitFor();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Admin overflow ${route} at ${width}`);
      }
    }
    await page.goto('http://127.0.0.1:5173/portfolio/'+projectId);await page.locator('h1').filter({hasText:title}).waitFor();
    await page.locator('.managed-detail-image').evaluate(image=>image.decode());
    assert.equal(await page.getByRole('link',{name:'Visit live project'}).getAttribute('href'),'https://example.com/smartaxis-test');
    await page.goto('http://127.0.0.1:5173/');await page.locator('#work-preview h3').filter({hasText:title}).waitFor();
    await page.goto('http://127.0.0.1:5173/contact');
    await page.getByRole('button',{name:'Send your inquiry',exact:true}).click();assert.equal(await page.locator('.contact-success').count(),0);
    await page.getByLabel('Your name').fill(name);await page.getByLabel('Work email').fill('browser-test@example.invalid');
    await page.getByLabel('04 — TELL US THE BIG PICTURE').fill('Browser verification of the live contact form and admin inbox.');
    await page.getByRole('button',{name:'Web development',exact:true}).click();
    await page.getByRole('button',{name:'Send your inquiry',exact:true}).click();
    await page.getByText('MESSAGE RECEIVED',{exact:true}).waitFor();
    const inquiries=await backend('/api/admin/inquiries');inquiryId=inquiries.data.inquiries.find(inquiry=>inquiry.name===name).id;
    await page.goto('http://127.0.0.1:5173/admin/inquiries');
    await page.locator('.admin-inquiry-list>button').filter({hasText:name}).click();
    await Promise.all([page.waitForResponse(response=>response.url().endsWith('/api/admin/inquiries/'+inquiryId)&&response.request().method()==='PATCH'&&response.ok()),page.getByLabel('Inquiry status').selectOption('read')]);
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:'admin-inbox-mobile-preview.png',fullPage:true});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'admin-inbox-preview.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: single persistent navbar, admin login, local upload, draft/publish, public project details/homepage, all admin pages at four widths, contact persistence, and inquiry status.');
  }finally{
    if(inquiryId)await backend('/api/admin/inquiries/'+inquiryId,'DELETE');
    if(projectId)await backend('/api/admin/projects/'+projectId,'DELETE');
    await backend('/api/admin/logout','POST').catch(()=>{});
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exit(1)});
