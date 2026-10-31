import { createApp } from '../server/app.mjs'
import { getDb } from '../server/database.mjs'
import { allowedOrigins } from '../server/origins.mjs'
import { portfolio } from '../src/data/portfolio.js'

const origins = allowedOrigins()

// Same-origin API keeps admin cookies on the website's domain.
export default createApp({getDb, origins, production:true, mongoImages:true, trustProxy:1, curatedProjects:portfolio, databaseConfigured:Boolean(process.env.MONGODB_URI)})
