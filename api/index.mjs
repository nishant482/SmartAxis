import { createApp } from '../server/app.mjs'
import { getDb } from '../server/database.mjs'
import { allowedOrigins } from '../server/origins.mjs'

const origins = allowedOrigins()

// Same-origin API keeps admin cookies on the website's domain.
export default createApp({getDb, origins, production:true, mongoImages:true, trustProxy:1})
