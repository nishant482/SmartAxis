import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ObjectId } from 'mongodb'
import sharp from 'sharp'
import { createApp,passwordHash } from '../server/app.mjs'
import { appCategories,appCategory } from '../src/data/content-categories.js'
import { catalogueApps,publishedApps,testingApps } from '../src/data/portfolio.js'

const same=(left,right)=>String(left)===String(right)
function matches(doc,filter={}){return Object.entries(filter).every(([key,value])=>{
  if(key==='$or')return value.some(clause=>matches(doc,clause))
  if(value&&typeof value==='object'&&!(value instanceof ObjectId)&&!(value instanceof Date)){
    if('$ne' in value)return !same(doc[key],value.$ne)
    if('$gt' in value)return doc[key]>value.$gt
    if('$regex' in value)return new RegExp(value.$regex,value.$options).test(doc[key]||'')
  }
  return typeof value==='boolean'?doc[key]===value:same(doc[key],value)
})}
export function memoryDb(){
  const collections=new Map()
  return {collection(name){if(!collections.has(name)){
    const rows=[]
    collections.set(name,{
      async findOne(filter){return rows.find(row=>matches(row,filter))||null},
      find(filter={}){let result=rows.filter(row=>matches(row,filter));return {sort(fields){result.sort((a,b)=>{for(const [field,direction] of Object.entries(fields)){if(a[field]>b[field])return direction;if(a[field]<b[field])return -direction}return 0});return this},skip(count){result=result.slice(count);return this},limit(count){result=result.slice(0,count);return this},async toArray(){return result.map(row=>({...row}))}}},
      async countDocuments(filter={}){return rows.filter(row=>matches(row,filter)).length},
      async distinct(field,filter={}){return [...new Set(rows.filter(row=>matches(row,filter)).map(row=>row[field]))]},
      async insertOne(doc){if(doc.slug&&rows.some(row=>row.slug===doc.slug))throw Object.assign(new Error('Duplicate slug'),{code:11000});const value={...doc,_id:doc._id||new ObjectId()};rows.push(value);return {insertedId:value._id}},
      async updateOne(filter,update){const row=rows.find(doc=>matches(doc,filter));if(!row)return {matchedCount:0};Object.assign(row,update.$set||{});return {matchedCount:1}},
      async deleteOne(filter){const index=rows.findIndex(row=>matches(row,filter));if(index<0)return {deletedCount:0};rows.splice(index,1);return {deletedCount:1}},
      async deleteMany(filter){for(let i=rows.length-1;i>=0;i--)if(matches(rows[i],filter))rows.splice(i,1);return {acknowledged:true}},
    })
  }return collections.get(name)},async command(){return {ok:1}}}
}
test('apps are categorized once, with testing games kept distinct from published apps',()=>{
  const ids=new Set(appCategories.map(category=>category.id))
  assert.ok(catalogueApps.every(app=>ids.has(appCategory(app))))
  assert.equal(appCategory(publishedApps.find(app=>app.id==='sanatan-wallpaper')),'sanatan')
  assert.equal(appCategory(publishedApps.find(app=>app.id==='learn-python')),'study')
  assert.equal(appCategory(publishedApps.find(app=>app.id==='islamic-wallpapers')),'other')
  assert.equal(testingApps.length,4)
  assert.ok(testingApps.every(app=>app.releaseStage==='testing'&&appCategory(app)==='games'))
  assert.ok(testingApps.every(app=>!publishedApps.some(published=>published.packageId===app.packageId)))
})
test('blog CMS protects writes, separates drafts, filters categories and manages covers',async()=>{
  const db=memoryDb(),password='Blog-testing-password-strong'
  await db.collection('admins').insertOne({username:'editor',passwordHash:await passwordHash(password)})
  const app=createApp({getDb:async()=>db,origins:['http://localhost:5173'],mongoImages:true,uploadDir:'unused'})
  const server=await new Promise(resolve=>{const value=app.listen(0,'127.0.0.1',()=>resolve(value))})
  const base=`http://127.0.0.1:${server.address().port}`
  let cookie=''
  async function request(route,{method='GET',body,authenticated=true,origin='http://localhost:5173'}={}){
    const headers={'X-Requested-With':'SmartAxis',Origin:origin}
    if(authenticated&&cookie)headers.Cookie=cookie
    if(body&&!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body)}
    return fetch(base+route,{method,headers,body})
  }
  const values={title:'A safe learning guide',slug:'safe-learning-guide',category:'Study Material',excerpt:'A short, helpful learning guide for mobile users.',content:'A real article body written for the test.\n\nA second paragraph with useful details.',published:false}
  try{
    assert.ok((await(await request('/sitemap-blogs.xml')).text()).includes('/blogs</loc>'),'Blog sitemap includes its public landing page even before articles are published')
    assert.equal((await request('/api/admin/blogs',{authenticated:false})).status,401)
    assert.equal((await request('/api/admin/blogs',{method:'POST',body:values,authenticated:false})).status,401)
    const login=await request('/api/admin/login',{method:'POST',body:{username:'editor',password}})
    assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0]
    assert.equal((await request('/api/admin/blogs',{method:'POST',body:values,origin:'https://untrusted.invalid'})).status,403)
    assert.equal((await request('/api/admin/blogs',{method:'POST',body:{...values,slug:'<script>'}})).status,400)
    assert.equal((await request('/api/admin/blogs',{method:'POST',body:{...values,category:{$ne:null}}})).status,400)
    const image=await sharp({create:{width:100,height:80,channels:3,background:'#5279bc'}}).png().toBuffer()
    const form=new FormData();for(const [key,value] of Object.entries(values))form.append(key,String(value));form.append('image',new Blob([image],{type:'image/png'}),'cover.png')
    const created=await request('/api/admin/blogs',{method:'POST',body:form});assert.equal(created.status,201);const id=(await created.json()).id
    assert.equal(await db.collection('projectImages').countDocuments(),1)
    assert.equal((await request('/api/blogs')).status,200)
    assert.equal((await (await request('/api/blogs')).json()).total,0)
    assert.equal((await request('/api/blogs/safe-learning-guide')).status,404)
    assert.ok(!(await (await request('/sitemap-blogs.xml')).text()).includes('safe-learning-guide'))
    const drafts=await(await request('/api/admin/blogs?status=draft')).json();assert.equal(drafts.total,1);assert.equal(drafts.posts[0].content,values.content)
    assert.equal((await request('/api/admin/blogs',{method:'POST',body:values})).status,409)
    assert.equal((await request(`/api/admin/blogs/${id}`,{method:'PUT',body:{...values,published:true}})).status,200)
    const detail=await(await request('/api/blogs/safe-learning-guide')).json();assert.equal(detail.post.content,values.content);assert.ok(detail.post.publishedAt);assert.equal('published' in detail.post,false)
    assert.equal((await request(detail.post.image)).status,200)
    assert.equal((await(await request('/api/blogs?category=Study%20Material')).json()).total,1)
    assert.equal((await(await request('/api/blogs?category=Games')).json()).total,0)
    assert.equal((await(await request('/api/blogs?search=learning')).json()).total,1)
    assert.equal((await(await request('/api/blogs?search=%28.%2A%29')).json()).total,0)
    assert.ok((await(await request('/sitemap-blogs.xml')).text()).includes('/blogs/safe-learning-guide'))
    assert.equal((await request(`/api/admin/blogs/${id}`,{method:'PUT',body:{...values,category:'Custom Category',published:false}})).status,200)
    assert.equal((await request('/api/blogs/safe-learning-guide')).status,404)
    assert.ok(!(await(await request('/api/blogs')).json()).categories.includes('Custom Category'))
    assert.ok((await(await request('/api/admin/blogs')).json()).categories.includes('Custom Category'))
    assert.equal((await request(`/api/admin/blogs/${id}`,{method:'DELETE',authenticated:false})).status,401)
    assert.equal((await request(`/api/admin/blogs/${id}`,{method:'DELETE'})).status,200)
    assert.equal(await db.collection('projectImages').countDocuments(),0)
    assert.equal((await request(`/api/admin/blogs/${id}`,{method:'DELETE'})).status,404)
    assert.equal((await(await request('/api/admin/blogs')).json()).total,0)
  }finally{await new Promise(resolve=>server.close(resolve))}
})
