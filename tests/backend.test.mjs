import 'dotenv/config'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MongoClient } from 'mongodb'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { createApp, passwordHash } from '../server/app.mjs'

test('MongoDB-backed admin, projects, local uploads, and contact security', {timeout:120000}, async () => {
  assert.ok(process.env.MONGODB_URI,'Set MONGODB_URI in .env')
  const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000})
  const dbName=`smartaxis_test_${randomUUID().replaceAll('-','').slice(0,16)}`
  const uploadDir=await mkdtemp(path.join(tmpdir(),'smartaxis-test-'))
  let server
  try {
    await client.connect()
    const db=client.db(dbName),password=`Test-${randomUUID()}`
    await db.collection('admins').insertOne({username:'testadmin',passwordHash:await passwordHash(password)})
    await db.collection('inquiries').createIndex({requestId:1},{unique:true})
    const app=createApp({getDb:async()=>db,uploadDir,origins:['http://localhost:5173']})
    server=await new Promise(resolve=>{const instance=app.listen(0,'127.0.0.1',()=>resolve(instance))})
    const base=`http://127.0.0.1:${server.address().port}`
    let cookie=''
    async function request(route,{method='GET',body,authenticated=true,origin='http://localhost:5173',verified=true}={}) {
      const headers={Origin:origin}
      if(verified)headers['X-Requested-With']='SmartAxis'
      if(authenticated&&cookie)headers.Cookie=cookie
      if(body&&!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body)}
      return fetch(base+route,{method,headers,body})
    }
    assert.equal((await request('/api/admin/projects')).status,401)
    assert.equal((await request('/api/admin/login',{method:'POST',body:{username:'testadmin',password},origin:'https://evil.invalid'})).status,403)
    assert.equal((await request('/api/admin/login',{method:'POST',body:{username:'testadmin',password},verified:false})).status,403)
    assert.equal((await request('/api/admin/login',{method:'POST',body:{username:{$ne:null},password}})).status,400)
    assert.equal((await request('/api/admin/login',{method:'POST',body:{username:'testadmin',password:'incorrect'}})).status,401)
    const login=await request('/api/admin/login',{method:'POST',body:{username:'testadmin',password}})
    assert.equal(login.status,200)
    const cookieHeader=login.headers.get('set-cookie')
    assert.match(cookieHeader,/HttpOnly/i);assert.match(cookieHeader,/SameSite=Strict/i)
    cookie=cookieHeader.split(';')[0]
    const image=await sharp({create:{width:100,height:80,channels:3,background:'#789bce'}}).png().toBuffer()
    function form(overrides={},file=image,type='image/png') {
      const data=new FormData()
      for(const [key,value] of Object.entries({title:'Integration test project',description:'A project created by the isolated integration test.',link:'https://example.com/project',category:'Web platforms',published:'true',featured:'true',order:'0',...overrides}))data.append(key,value)
      if(file)data.append('image',new Blob([file],{type}),'../../example.png')
      return data
    }
    assert.equal((await request('/api/admin/projects',{method:'POST',body:form(),authenticated:false})).status,401)
    assert.equal((await request('/api/admin/projects',{method:'POST',body:form({link:'javascript:alert(1)'})})).status,400)
    assert.equal((await request('/api/admin/projects',{method:'POST',body:form({},Buffer.from('<svg onload="alert(1)"></svg>'),'image/svg+xml')})).status,400)
    assert.equal((await readdir(uploadDir)).length,0,'Invalid uploads do not leave files')
    const created=await request('/api/admin/projects',{method:'POST',body:form()})
    assert.equal(created.status,201)
    const {id}=await created.json()
    const publicData=await (await request('/api/projects')).json()
    assert.equal(publicData.projects.length,1)
    assert.ok(!('published' in publicData.projects[0]))
    const firstImage=publicData.projects[0].image
    assert.match(firstImage,/^\/uploads\/[a-f\d-]{36}\.webp$/)
    const imageResponse=await fetch(base+firstImage)
    assert.equal(imageResponse.status,200);assert.match(imageResponse.headers.get('content-type'),/image\/webp/)
    assert.equal((await request(`/api/admin/projects/${id}`,{method:'PUT',body:form({published:'false',title:'Draft title'},null)})).status,200)
    assert.equal((await (await request('/api/projects')).json()).projects.length,0)
    assert.equal((await request(`/api/projects/${id}`)).status,404,'Draft details are not public')
    assert.equal((await (await request('/api/admin/projects?search=Draft')).json()).total,1)
    assert.equal((await request(`/api/admin/projects/${id}`,{method:'PUT',body:form({title:'Updated title'})})).status,200)
    assert.equal((await fetch(base+firstImage)).status,404,'Old image removed after replacement')
    assert.equal((await readdir(uploadDir)).length,1)
    const inquiry={name:'Integration Test',email:'test@example.invalid',company:'Test',phone:'',services:['Web development'],budget:'Under $5k',details:'Please build an example portfolio for my business.',requestId:randomUUID()}
    assert.equal((await request('/api/contact',{method:'POST',body:{...inquiry,email:'invalid'}})).status,400)
    assert.equal((await request('/api/contact',{method:'POST',body:inquiry})).status,201)
    assert.equal((await request('/api/contact',{method:'POST',body:inquiry})).status,200)
    assert.equal(await db.collection('inquiries').countDocuments(),1,'Retries do not duplicate contact submissions')
    assert.equal((await request('/api/admin/inquiries',{authenticated:false})).status,401)
    const inbox=await (await request('/api/admin/inquiries')).json(),inquiryId=inbox.inquiries[0].id
    assert.equal((await request(`/api/admin/inquiries/${inquiryId}`,{method:'PATCH',body:{status:'read'}})).status,200)
    assert.equal((await (await request('/api/admin/inquiries?status=read')).json()).total,1)
    assert.equal((await request(`/api/admin/inquiries/${inquiryId}`,{method:'DELETE'})).status,200)
    assert.equal((await request(`/api/admin/projects/${id}`,{method:'DELETE'})).status,200)
    assert.equal((await readdir(uploadDir)).length,0)
    const changed=await request('/api/admin/password',{method:'POST',body:{currentPassword:password,newPassword:password+'new'}})
    assert.equal(changed.status,200)
    assert.equal((await request('/api/admin/session')).status,401,'Password change revokes old sessions')
    assert.equal((await request('/api/admin/login',{method:'POST',body:{username:'testadmin',password}})).status,401)
    const secondLogin=await request('/api/admin/login',{method:'POST',body:{username:'testadmin',password:password+'new'}})
    assert.equal(secondLogin.status,200);cookie=secondLogin.headers.get('set-cookie').split(';')[0]
    assert.equal((await request('/api/admin/logout',{method:'POST'})).status,200)
    assert.equal((await request('/api/admin/session')).status,401)
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve))
    assert.match(dbName,/^smartaxis_test_[a-f\d]{16}$/)
    await client.db(dbName).dropDatabase().catch(()=>{})
    await client.close()
    assert.equal(path.dirname(path.resolve(uploadDir)),path.resolve(tmpdir()))
    assert.ok(path.basename(uploadDir).startsWith('smartaxis-test-'))
    await rm(uploadDir,{recursive:true,force:true})
  }
})
