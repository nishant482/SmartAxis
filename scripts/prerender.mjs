import { build } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { metadataFor, pageMetadata, structuredData, siteUrl } from '../src/lib/seo.js'

await build({build:{ssr:'src/entry-server.jsx',outDir:'.prerender',emptyOutDir:true}})
const { render }=await import(pathToFileURL(path.resolve('.prerender/entry-server.js')))
const template=await readFile('dist/index.html','utf8')
const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
function documentFor(route,content) {
  const m=metadataFor(route)
  const head=`<title>${escape(m.title)}</title>
    <meta name="description" content="${escape(m.description)}" />
    <meta name="robots" content="${m.noindex?'noindex, follow':'index, follow, max-image-preview:large'}" />
    <link rel="canonical" href="${escape(m.canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SmartAxis" />
    <meta property="og:title" content="${escape(m.title)}" />
    <meta property="og:description" content="${escape(m.description)}" />
    <meta property="og:url" content="${escape(m.canonical)}" />
    <meta property="og:image" content="${siteUrl}/social-card.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(m.title)}" />
    <meta name="twitter:description" content="${escape(m.description)}" />
    <meta name="twitter:image" content="${siteUrl}/social-card.png" />
    <script id="structured-data" type="application/ld+json">${JSON.stringify(structuredData(route,m)).replaceAll('<','\\u003c')}</script>`
  return template.replace(/<title>.*?<\/title>/s,'').replace(/<meta name="description"[^>]*>/,'').replace('</head>',`${head}</head>`).replace('<div id="root"></div>',`<div id="root">${content}</div>`)
}
for(const route of Object.keys(pageMetadata)) {
  const file=route==='/'?'dist/index.html':`dist${route}.html`
  await mkdir(path.dirname(file),{recursive:true})
  await writeFile(file,documentFor(route,render(route)))
}
await writeFile('dist/404.html',documentFor('/404',render('/404')))
// Dynamic project/admin routes retain the client shell without a misleading
// homepage canonical or homepage content.
await writeFile('dist/shell.html',template)
await writeFile('dist/sitemap-pages.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pageMetadata).map(route=>`<url><loc>${siteUrl}${route==='/'?'':route}</loc></url>`).join('')}</urlset>`)
console.log(`Prerendered ${Object.keys(pageMetadata).length} public pages and 404.`)
