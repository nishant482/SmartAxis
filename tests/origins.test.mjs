import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allowedOrigins } from '../server/origins.mjs'
import { createApp } from '../server/app.mjs'

test('production origin remains allowed with stale or API-path environment values', async()=>{
  const origins=allowedOrigins({PUBLIC_ORIGINS:'http://localhost:5173, https://smart-axis.vercel.app/api/, https://custom.example/, invalid',VERCEL_URL:'smart-axis-preview.vercel.app'})
  assert.ok(origins.includes('https://smart-axis.vercel.app'))
  assert.ok(origins.includes('https://custom.example'))
  assert.ok(origins.includes('https://smart-axis-preview.vercel.app'))
  assert.ok(allowedOrigins({PUBLIC_ORIGINS:'http://localhost:5173'}).includes('https://smart-axis.vercel.app'))
  const app=createApp({getDb:async()=>{throw Error('Database should not be reached')},uploadDir:'server/uploads',origins})
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s))})
  try {
    const request=origin=>fetch(`http://127.0.0.1:${server.address().port}/api/contact`,{method:'POST',headers:{Origin:origin,'X-Requested-With':'SmartAxis','Content-Type':'application/json'},body:'{}'})
    assert.equal((await request('https://smart-axis.vercel.app')).status,400)
    assert.equal((await request('https://custom.example')).status,400)
    assert.equal((await request('https://untrusted.invalid')).status,403)
    assert.equal((await request('https://smart-axis.vercel.app.evil.invalid')).status,403)
  } finally { await new Promise(resolve=>server.close(resolve)) }
})
