import { ObjectId } from 'mongodb'
import multer from 'multer'
import { blogCategoryDefaults } from '../src/data/content-categories.js'
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:4*1024*1024,files:1,fields:8,fieldSize:150000,parts:9}}).single('image')
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/
const published=()=>({published:true})
export function blogSlug(value){return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120).replace(/-$/,'')}
export function blogFields(body,{text,flag,RequestError}){
  const title=text(body.title,'Title',3,160),slug=text(body.slug,'URL slug',1,120),category=text(body.category,'Category',2,80)
  if(!slugPattern.test(slug))throw new RequestError('Use lowercase letters, numbers and hyphens for the URL slug.')
  return {title,slug,category,excerpt:text(body.excerpt,'Excerpt',10,400),content:text(body.content,'Article content',30,40000).replace(/\r\n?/g,'\n'),published:flag(body.published)}
}
function serialize(post,{full=false,admin=false}={}){
  const value={id:post._id.toString(),title:post.title,slug:post.slug,category:post.category,excerpt:post.excerpt,image:post.image||null,publishedAt:post.publishedAt||null,updatedAt:post.updatedAt}
  if(full)value.content=post.content
  if(admin){value.published=post.published;value.createdAt=post.createdAt}
  return value
}
function pagination(query){return {page:Math.max(1,Math.min(10000,parseInt(query.page,10)||1)),limit:Math.max(1,Math.min(24,parseInt(query.limit,10)||12))}}
function literalSearch(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
export function registerBlogs(app,ctx){
  const {getDb,auth,text,flag,RequestError,databaseConfigured,storeImage,removeImage}=ctx
  const fields=body=>blogFields(body,{text,flag,RequestError})
  const identifier=value=>{if(!/^[a-f\d]{24}$/i.test(value))throw new RequestError('Article not found.',404);return new ObjectId(value)}
  app.get('/api/blogs',async(req,res)=>{
    const {page,limit}=pagination(req.query)
    if(!databaseConfigured)return res.json({posts:[],categories:blogCategoryDefaults,total:0,page,pages:1})
    const db=await getDb(),collection=db.collection('blogPosts'),filter=published()
    if(typeof req.query.category==='string'&&req.query.category.trim())filter.category=text(req.query.category,'Category',2,80)
    const search=typeof req.query.search==='string'?req.query.search.trim().slice(0,100):''
    if(search)filter.$or=[{title:{$regex:literalSearch(search),$options:'i'}},{excerpt:{$regex:literalSearch(search),$options:'i'}}]
    const [posts,total,existing]=await Promise.all([collection.find(filter).sort({publishedAt:-1,_id:-1}).skip((page-1)*limit).limit(limit).toArray(),collection.countDocuments(filter),collection.distinct('category',published())])
    res.json({posts:posts.map(post=>serialize(post)),categories:[...new Set([...blogCategoryDefaults,...existing])],total,page,pages:Math.max(1,Math.ceil(total/limit))})
  })
  app.get('/api/blogs/:slug',async(req,res)=>{
    if(!databaseConfigured||!slugPattern.test(req.params.slug))throw new RequestError('Article not found.',404)
    const db=await getDb(),post=await db.collection('blogPosts').findOne({slug:req.params.slug,published:true})
    if(!post)throw new RequestError('Article not found.',404)
    res.json({post:serialize(post,{full:true})})
  })
  app.get('/sitemap-blogs.xml',async(req,res)=>{
    const db=databaseConfigured?await getDb():null
    const posts=db?await db.collection('blogPosts').find(published(),{projection:{slug:1}}).limit(45000).toArray():[]
    res.type('application/xml').set('Cache-Control','public, max-age=300').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://smartxapp-studio.vercel.app/blogs</loc></url>${posts.filter(post=>slugPattern.test(post.slug)).map(post=>`<url><loc>https://smartxapp-studio.vercel.app/blogs/${post.slug}</loc></url>`).join('')}</urlset>`)
  })
  app.get('/api/admin/blogs',auth,async(req,res)=>{
    const {page,limit}=pagination(req.query),collection=req.db.collection('blogPosts'),filter={}
    if(req.query.status==='published')filter.published=true
    if(req.query.status==='draft')filter.published=false
    if(typeof req.query.category==='string'&&req.query.category.trim())filter.category=text(req.query.category,'Category',2,80)
    const search=typeof req.query.search==='string'?req.query.search.trim().slice(0,100):''
    if(search)filter.title={$regex:literalSearch(search),$options:'i'}
    const [posts,total,existing]=await Promise.all([collection.find(filter).sort({updatedAt:-1,_id:-1}).skip((page-1)*limit).limit(limit).toArray(),collection.countDocuments(filter),collection.distinct('category')])
    res.json({posts:posts.map(post=>serialize(post,{full:true,admin:true})),categories:[...new Set([...blogCategoryDefaults,...existing])],total,page,pages:Math.max(1,Math.ceil(total/limit))})
  })
  app.post('/api/admin/blogs',auth,upload,async(req,res)=>{
    const value=fields(req.body),collection=req.db.collection('blogPosts')
    if(await collection.findOne({slug:value.slug}))throw new RequestError('This article URL is already used. Choose another slug.',409)
    const image=await storeImage(req.file),now=new Date()
    try{const result=await collection.insertOne({...value,image,createdAt:now,updatedAt:now,publishedAt:value.published?now:null});res.status(201).json({id:result.insertedId.toString(),message:value.published?'Article published.':'Draft saved.'})}
    catch(error){if(image)await removeImage(image);if(error.code===11000)throw new RequestError('This article URL is already used.',409);throw error}
  })
  app.put('/api/admin/blogs/:id',auth,upload,async(req,res)=>{
    const _id=identifier(req.params.id),value=fields(req.body),collection=req.db.collection('blogPosts'),existing=await collection.findOne({_id})
    if(!existing)throw new RequestError('Article not found.',404)
    if(await collection.findOne({slug:value.slug,_id:{$ne:_id}}))throw new RequestError('This article URL is already used. Choose another slug.',409)
    const image=req.file?await storeImage(req.file):existing.image||null,now=new Date()
    try{const result=await collection.updateOne({_id},{$set:{...value,image,updatedAt:now,publishedAt:value.published?(existing.publishedAt||now):existing.publishedAt||null}});if(!result.matchedCount)throw new RequestError('Article not found.',404)}
    catch(error){if(req.file&&image)await removeImage(image);if(error.code===11000)throw new RequestError('This article URL is already used.',409);throw error}
    if(req.file&&existing.image)await removeImage(existing.image)
    res.json({message:value.published?'Article published.':'Draft saved.'})
  })
  app.delete('/api/admin/blogs/:id',auth,async(req,res)=>{
    const collection=req.db.collection('blogPosts'),_id=identifier(req.params.id),existing=await collection.findOne({_id})
    if(!existing)throw new RequestError('Article not found.',404)
    const result=await collection.deleteOne({_id});if(!result.deletedCount)throw new RequestError('Article not found.',404)
    if(existing.image)await removeImage(existing.image)
    res.json({ok:true})
  })
}
