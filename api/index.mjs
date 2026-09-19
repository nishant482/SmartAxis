import { createApp } from '../server/app.mjs'
import { getDb } from '../server/database.mjs'

const origins = (process.env.PUBLIC_ORIGINS || 'https://smart-axis.vercel.app')
  .split(',').map(value => value.trim()).filter(Boolean)

// Same-origin API keeps admin cookies on the website's domain.
export default createApp({getDb, origins, production:true, mongoImages:true, trustProxy:1})
