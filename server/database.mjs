import { MongoClient } from 'mongodb'

let client
let db
let ready
function initialize() {
  if (client) return
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured')
  client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000,maxPoolSize:10})
  db=client.db(process.env.MONGODB_DB || 'smartaxis')
}
export async function getDb() {
  initialize()
  if (!ready) ready=(async()=>{
    await client.connect()
    await Promise.all([
      db.collection('sessions').createIndex({expiresAt:1},{expireAfterSeconds:0}),
      db.collection('admins').createIndex({username:1},{unique:true}),
      db.collection('inquiries').createIndex({requestId:1},{unique:true,sparse:true}),
      db.collection('inquiries').createIndex({status:1,createdAt:-1}),
      db.collection('projects').createIndex({published:1,order:1,createdAt:-1}),
    ])
    if (process.env.ADMIN_PASSWORD_HASH) await db.collection('admins').updateOne({username:process.env.ADMIN_USERNAME||'admin'},{$setOnInsert:{passwordHash:process.env.ADMIN_PASSWORD_HASH,createdAt:new Date()}},{upsert:true})
    console.log('MongoDB connected; admin and indexes are ready.')
    return db
  })().catch(error=>{ready=null;throw error})
  return ready
}

export async function closeDatabase() { await client?.close(); ready=null; client=null }
