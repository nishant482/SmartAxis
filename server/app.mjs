import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import sharp from 'sharp'
import { ObjectId } from 'mongodb'
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'

const deriveKey = promisify(scrypt)
const categories = ['Web platforms', 'E-commerce', 'Mobile apps', 'Design', 'Other']
const sessionHours = 8
const tokenHash = token => createHash('sha256').update(token).digest('hex')
class RequestError extends Error { constructor(message, status = 400) { super(message); this.status = status } }
function text(value, field, min = 0, max = 200) {
  if (typeof value !== 'string') { if (!min && value == null) return ''; throw new RequestError(`${field} must be text.`) }
  const clean = value.trim()
  if (clean.length < min || clean.length > max) throw new RequestError(`${field} must contain ${min}–${max} characters.`)
  return clean
}
function id(value) { if (!/^[a-f\d]{24}$/i.test(value)) throw new RequestError('Not found.', 404); return new ObjectId(value) }
function flag(value) { if (![true,false,'true','false',undefined].includes(value)) throw new RequestError('Invalid option.'); return value === true || value === 'true' }
function projectFields(body) {
  const title = text(body.title, 'Title', 2, 120), description = text(body.description, 'Description', 10, 5000)
  const link = text(body.link, 'Project URL', 1, 2048)
  let parsed
  try { parsed = new URL(link) } catch { throw new RequestError('Enter a valid project URL including https://.') }
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new RequestError('Use a public HTTP or HTTPS project URL without credentials.')
  if (!categories.includes(body.category)) throw new RequestError('Choose a valid category.')
  const order = Number(body.order ?? 0)
  if (!Number.isInteger(order) || order < 0 || order > 9999) throw new RequestError('Display order must be between 0 and 9999.')
  return {title, description, link:parsed.href, category:body.category, published:flag(body.published), featured:flag(body.featured), order}
}
async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 256 || typeof stored !== 'string') return false
  const [salt, hash] = stored.split(':')
  if (!salt || !/^[a-f\d]{128}$/i.test(hash || '')) return false
  const actual = await deriveKey(password, salt, 64)
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'))
}
export async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${(await deriveKey(password, salt, 64)).toString('hex')}`
}
function sessionToken(req) {
  const match = (req.headers.cookie || '').match(/(?:^|;\s*)sa_session=([a-f\d]{64})(?:;|$)/)
  return match?.[1]
}
function publicProject(p) {
  return {id:p._id.toString(),title:p.title,description:p.description,category:p.category,link:p.link,image:p.image,featured:p.featured,order:p.order}
}

export function createApp({getDb, uploadDir, origins, production = false, distDir, mongoImages = false, trustProxy = false}) {
  const app = express()
  app.set('trust proxy',trustProxy)
  app.disable('x-powered-by')
  app.use(helmet({contentSecurityPolicy:production ? {directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:','blob:'],connectSrc:["'self'"],objectSrc:["'none'"],upgradeInsecureRequests:null}} : false, strictTransportSecurity:production ? undefined : false}))
  app.use(express.json({limit:'32kb'}))
  app.use('/api', (req,res,next) => {
    req.body ??= {}
    res.set('Cache-Control','no-store')
    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      if (req.get('X-Requested-With') !== 'SmartAxis') return res.status(403).json({error:'Request verification failed.'})
      if (req.get('Origin') && !origins.includes(req.get('Origin'))) return res.status(403).json({error:'This origin is not allowed.'})
    }
    next()
  })
  const cookie = {httpOnly:true,sameSite:'strict',secure:production,path:'/api',maxAge:sessionHours*3600000}
  const loginLimit = rateLimit({windowMs:15*60000,limit:10,skipSuccessfulRequests:true,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Too many sign-in attempts. Try again in 15 minutes.'}})
  const contactLimit = rateLimit({windowMs:15*60000,limit:10,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Too many submissions. Please try again later.'}})
  const upload = multer({storage:multer.memoryStorage(),limits:{fileSize:4*1024*1024,files:1,fields:10,fieldSize:10000,parts:11}}).single('image')
  async function auth(req,res,next) {
    const token = sessionToken(req)
    if (!token) throw new RequestError('Please sign in.',401)
    const db = await getDb()
    const session = await db.collection('sessions').findOne({_id:tokenHash(token),expiresAt:{$gt:new Date()}})
    if (!session) { res.clearCookie('sa_session',{...cookie,maxAge:undefined}); throw new RequestError('Your session expired. Please sign in again.',401) }
    req.adminId = session.adminId; req.db = db; next()
  }
  async function storeImage(file) {
    if (!file) return null
    let buffer
    try {
      const image = sharp(file.buffer,{limitInputPixels:40_000_000,failOn:'error'})
      const metadata = await image.metadata()
      if (!['jpeg','png','webp'].includes(metadata.format) || (metadata.pages || 1) > 1) throw new Error('Unsupported image')
      buffer = await image.rotate().resize({width:2400,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer()
    } catch { throw new RequestError('Upload a valid JPG, PNG, or WebP image under 4 MB (up to 40 megapixels).') }
    const filename = `${randomUUID()}.webp`
    if (mongoImages) {
      if (buffer.length > 4*1024*1024) throw new RequestError('Choose a smaller image (processed image must be under 4 MB).')
      const db=await getDb()
      await db.collection('projectImages').insertOne({_id:filename,data:buffer,createdAt:new Date()})
    } else {
      await mkdir(uploadDir,{recursive:true})
      await writeFile(path.join(uploadDir,filename),buffer,{flag:'wx'})
    }
    return `/uploads/${filename}`
  }
  async function removeImage(image) {
    if (!/^\/uploads\/[a-f\d-]{36}\.webp$/.test(image || '')) return
    if (mongoImages) { const db=await getDb(); await db.collection('projectImages').deleteOne({_id:path.basename(image)}); return }
    await unlink(path.join(uploadDir,path.basename(image))).catch(error => { if (error.code !== 'ENOENT') console.warn('An unused project image could not be removed.') })
  }
  app.get('/api/health',async (req,res) => { const db=await getDb(); await db.command({ping:1}); res.json({status:'ok',database:'connected'}) })
  app.get('/api/projects',async (req,res) => {
    const db=await getDb()
    const projects=await db.collection('projects').find({published:true}).sort({order:1,createdAt:-1}).toArray()
    res.json({projects:projects.map(publicProject)})
  })
  app.get('/api/projects/:id',async (req,res) => {
    const projectId=id(req.params.id),db=await getDb()
    const project=await db.collection('projects').findOne({_id:projectId,published:true})
    if (!project) throw new RequestError('Project not found.',404)
    res.json({project:publicProject(project)})
  })
  app.post('/api/contact',contactLimit,async (req,res) => {
    const name=text(req.body.name,'Name',2,100),email=text(req.body.email,'Email',3,160)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError('Enter a valid email address.')
    const company=text(req.body.company,'Company',0,150),phone=text(req.body.phone,'Phone',0,30),details=text(req.body.details,'Project details',10,5000),budget=text(req.body.budget,'Budget',0,80)
    if (!Array.isArray(req.body.services) || req.body.services.length>12) throw new RequestError('Invalid services selection.')
    const services=req.body.services.map(value=>text(value,'Service',1,80))
    const requestId=text(req.body.requestId,'Submission ID',36,36)
    if (!/^[a-f\d-]{36}$/i.test(requestId)) throw new RequestError('Invalid submission ID.')
    const db=await getDb()
    const inquiry={name,email,company,phone,details,budget,services,requestId,status:'new',createdAt:new Date(),updatedAt:new Date()}
    try { const result=await db.collection('inquiries').insertOne(inquiry); res.status(201).json({id:result.insertedId.toString(),message:'Your inquiry has been received.'}) }
    catch(error) { if (error.code!==11000) throw error; res.json({message:'Your inquiry has already been received.'}) }
  })
  app.post('/api/admin/login',loginLimit,async (req,res) => {
    const username=text(req.body.username,'Username',1,100),db=await getDb()
    const admin=await db.collection('admins').findOne({username})
    const dummy='00000000000000000000000000000000:'+ '0'.repeat(128)
    const valid=await verifyPassword(req.body.password,admin?.passwordHash || dummy)
    if (!admin || !valid) throw new RequestError('Incorrect username or password.',401)
    const token=randomBytes(32).toString('hex')
    await db.collection('sessions').insertOne({_id:tokenHash(token),adminId:admin._id,expiresAt:new Date(Date.now()+cookie.maxAge)})
    res.cookie('sa_session',token,cookie).json({username:admin.username})
  })
  app.get('/api/admin/session',auth,async (req,res) => {
    const admin=await req.db.collection('admins').findOne({_id:req.adminId})
    if (!admin) throw new RequestError('Please sign in.',401)
    res.json({username:admin.username})
  })
  app.post('/api/admin/logout',async (req,res) => {
    const token=sessionToken(req)
    if (token) { const db=await getDb(); await db.collection('sessions').deleteOne({_id:tokenHash(token)}) }
    res.clearCookie('sa_session',{httpOnly:true,sameSite:'strict',secure:production,path:'/api'}).json({ok:true})
  })
  app.use('/api/admin',auth)
  app.get('/api/admin/overview',async (req,res) => {
    const [projects,published,inquiries,unread]=await Promise.all([req.db.collection('projects').countDocuments(),req.db.collection('projects').countDocuments({published:true}),req.db.collection('inquiries').countDocuments(),req.db.collection('inquiries').countDocuments({status:'new'})])
    res.json({projects,published,inquiries,unread})
  })
  app.get('/api/admin/projects',async (req,res) => {
    const page=Math.max(1,Number.parseInt(req.query.page,10)||1),search=String(req.query.search||'').slice(0,100)
    const filter=search ? {title:{$regex:search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'}} : {}
    const [projects,total]=await Promise.all([req.db.collection('projects').find(filter).sort({createdAt:-1}).skip((page-1)*20).limit(20).toArray(),req.db.collection('projects').countDocuments(filter)])
    res.json({projects:projects.map(p=>({...publicProject(p),published:p.published,createdAt:p.createdAt})),total,page,pages:Math.max(1,Math.ceil(total/20))})
  })
  app.post('/api/admin/projects',upload,async (req,res) => {
    const fields=projectFields(req.body)
    if (!req.file) throw new RequestError('Choose a project image.')
    const image=await storeImage(req.file)
    try { const now=new Date(); const result=await req.db.collection('projects').insertOne({...fields,image,createdAt:now,updatedAt:now}); res.status(201).json({id:result.insertedId.toString()}) }
    catch(error) { await removeImage(image); throw error }
  })
  app.put('/api/admin/projects/:id',upload,async (req,res) => {
    const projectId=id(req.params.id),fields=projectFields(req.body)
    const current=await req.db.collection('projects').findOne({_id:projectId})
    if (!current) throw new RequestError('Project not found.',404)
    const image=await storeImage(req.file)
    try { const result=await req.db.collection('projects').updateOne({_id:projectId},{$set:{...fields,image:image||current.image,updatedAt:new Date()}}); if (!result.matchedCount) throw new RequestError('Project no longer exists.',404) }
    catch(error) { await removeImage(image); throw error }
    if (image) await removeImage(current.image)
    res.json({ok:true})
  })
  app.delete('/api/admin/projects/:id',async (req,res) => {
    const project=await req.db.collection('projects').findOneAndDelete({_id:id(req.params.id)})
    if (!project) throw new RequestError('Project not found.',404)
    await removeImage(project.image); res.json({ok:true})
  })
  app.get('/api/admin/inquiries',async (req,res) => {
    const page=Math.max(1,Number.parseInt(req.query.page,10)||1),status=req.query.status
    if (status && !['new','read','archived'].includes(status)) throw new RequestError('Invalid inquiry status.')
    const filter=status ? {status} : {}
    const [inquiries,total]=await Promise.all([req.db.collection('inquiries').find(filter,{projection:{requestId:0}}).sort({createdAt:-1}).skip((page-1)*20).limit(20).toArray(),req.db.collection('inquiries').countDocuments(filter)])
    res.json({inquiries:inquiries.map(({_id,...inquiry})=>({...inquiry,id:_id.toString()})),total,page,pages:Math.max(1,Math.ceil(total/20))})
  })
  app.patch('/api/admin/inquiries/:id',async (req,res) => {
    if (!['new','read','archived'].includes(req.body.status)) throw new RequestError('Choose a valid status.')
    const result=await req.db.collection('inquiries').updateOne({_id:id(req.params.id)},{$set:{status:req.body.status,updatedAt:new Date()}})
    if (!result.matchedCount) throw new RequestError('Inquiry not found.',404)
    res.json({ok:true})
  })
  app.delete('/api/admin/inquiries/:id',async (req,res) => {
    const result=await req.db.collection('inquiries').deleteOne({_id:id(req.params.id)})
    if (!result.deletedCount) throw new RequestError('Inquiry not found.',404)
    res.json({ok:true})
  })
  app.post('/api/admin/password',loginLimit,async (req,res) => {
    const admin=await req.db.collection('admins').findOne({_id:req.adminId})
    if (!admin || !await verifyPassword(req.body.currentPassword,admin.passwordHash)) throw new RequestError('Current password is incorrect.')
    if (typeof req.body.newPassword!=='string' || req.body.newPassword.length<12 || req.body.newPassword.length>128) throw new RequestError('Use a new password with 12–128 characters.')
    await req.db.collection('admins').updateOne({_id:req.adminId},{$set:{passwordHash:await passwordHash(req.body.newPassword),updatedAt:new Date()}})
    await req.db.collection('sessions').deleteMany({adminId:req.adminId})
    res.clearCookie('sa_session',{httpOnly:true,sameSite:'strict',secure:production,path:'/api'}).json({ok:true})
  })
  app.use('/api',(req,res)=>res.status(404).json({error:'API endpoint not found.'}))
  if (mongoImages) {
    app.get('/uploads/:filename',async (req,res)=>{
      if (!/^[a-f\d-]{36}\.webp$/.test(req.params.filename)) throw new RequestError('File not found.',404)
      const db=await getDb(),file=await db.collection('projectImages').findOne({_id:req.params.filename})
      if (!file) throw new RequestError('File not found.',404)
      res.type('webp').set('Cache-Control','public, max-age=86400').send(Buffer.from(file.data.buffer))
    })
    app.use('/uploads',(req,res)=>res.status(404).json({error:'File not found.'}))
  } else app.use('/uploads',express.static(uploadDir,{dotfiles:'deny',index:false,maxAge:'1d',fallthrough:false,setHeaders:res=>res.set('X-Content-Type-Options','nosniff')}))
  if (distDir) { app.use(express.static(distDir)); app.get('/{*path}',(req,res)=>res.sendFile(path.join(distDir,'index.html'))) }
  app.use((error,req,res,next) => {
    if (res.headersSent) return next(error)
    if (error instanceof multer.MulterError) return res.status(400).json({error:error.code==='LIMIT_FILE_SIZE' ? 'Image must be under 4 MB.' : 'Invalid upload. Choose one image and try again.'})
    if (error instanceof RequestError) return res.status(error.status).json({error:error.message})
    if (error.type==='entity.too.large') return res.status(413).json({error:'The submission is too large.'})
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({error:'Invalid JSON request.'})
    if (error.status===404) return res.status(404).json({error:'File not found.'})
    console.error('Request failed:',error.name,error.code || '')
    res.status(503).json({error:'The server is temporarily unavailable. Please try again shortly.'})
  })
  return app
}
