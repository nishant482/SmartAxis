import 'dotenv/config'
import { getDb, closeDatabase } from './database.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.mjs'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
if (!process.env.MONGODB_URI || !process.env.ADMIN_PASSWORD_HASH) { console.error('Configure MONGODB_URI in .env and run npm run admin:setup.'); process.exit(1) }
const production=process.env.NODE_ENV==='production'
const origins=(process.env.PUBLIC_ORIGINS||'http://localhost:5173,http://127.0.0.1:5173').split(',').map(value=>value.trim())
const app=createApp({getDb,uploadDir:path.join(root,'server/uploads'),origins,production,distDir:path.join(root,'dist')})
const port=Number(process.env.PORT)||4000
const server=app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`SmartAxis API: http://${process.env.HOST||'127.0.0.1'}:${port}`))
getDb().catch(error=>console.error('MongoDB connection pending:',error.name,error.code||'', '(check database access and network settings)'))
async function shutdown() { server.close(); await closeDatabase(); process.exit(0) }
process.on('SIGINT',shutdown); process.on('SIGTERM',shutdown)
