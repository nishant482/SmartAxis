import 'dotenv/config'
import { MongoClient } from 'mongodb'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.mjs'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
if (!process.env.MONGODB_URI || !process.env.ADMIN_PASSWORD_HASH) { console.error('Configure MONGODB_URI in .env and run npm run admin:setup.'); process.exit(1) }
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000,maxPoolSize:10})
const db=client.db(process.env.MONGODB_DB || 'smartaxis')
let ready
async function getDb() {
  if (!ready) ready=(async()=>{
    await client.connect()
    await Promise.all([
      db.collection('sessions').createIndex({expiresAt:1},{expireAfterSeconds:0}),
      db.collection('admins').createIndex({username:1},{unique:true}),
      db.collection('inquiries').createIndex({requestId:1},{unique:true,sparse:true}),
      db.collection('inquiries').createIndex({status:1,createdAt:-1}),
      db.collection('projects').createIndex({published:1,order:1,createdAt:-1}),
    ])
    await db.collection('admins').updateOne({username:process.env.ADMIN_USERNAME||'admin'},{$setOnInsert:{passwordHash:process.env.ADMIN_PASSWORD_HASH,createdAt:new Date()}},{upsert:true})
    console.log('MongoDB connected; admin and indexes are ready.')
    return db
  })().catch(error=>{ready=null;throw error})
  return ready
}
const production=process.env.NODE_ENV==='production'
const origins=(process.env.PUBLIC_ORIGINS||'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value=>value.trim())
const app=createApp({getDb,uploadDir:path.join(root,'server/uploads'),origins,production,distDir:path.join(root,'dist')})
const port=Number(process.env.PORT)||4000
const server=app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`SmartAxis API: http://${process.env.HOST||'127.0.0.1'}:${port}`))
getDb().catch(error=>console.error('MongoDB connection pending:',error.name,error.code||'', '(check database access and network settings)'))
async function shutdown() { server.close(); await client.close(); process.exit(0) }
process.on('SIGINT',shutdown); process.on('SIGTERM',shutdown)
