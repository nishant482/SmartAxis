import { access,mkdir,writeFile } from 'node:fs/promises'
import { publishedApps,ownedProjects } from '../src/data/portfolio.js'
import sharp from 'sharp'
const destination=new URL('../public/portfolio/apps/',import.meta.url)
await mkdir(destination,{recursive:true})
for(const app of [...publishedApps,...ownedProjects.filter(project=>project.link?.includes('/store/apps/details')&&project.image)]){
  if(await access(new URL(`${app.id}.webp`,destination)).then(()=>true).catch(()=>false))continue
  try{
    const response=await fetch(app.link,{signal:AbortSignal.timeout(20000)})
    if(!response.ok)throw new Error(`Store response ${response.status}`)
    const html=await response.text()
    const icon=html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1]
    if(!icon||!icon.startsWith('https://play-lh.googleusercontent.com/'))throw new Error('Official icon not available')
    const image=await fetch(icon.replaceAll('&amp;','&'),{signal:AbortSignal.timeout(20000)})
    if(!image.ok)throw new Error('Icon download failed')
    await writeFile(new URL(`${app.id}.webp`,destination),await sharp(Buffer.from(await image.arrayBuffer())).resize(384,384,{fit:'inside'}).webp({quality:88}).toBuffer())
    console.log(`Saved official icon: ${app.id}`)
  }catch(error){console.log(`Using identity fallback for ${app.id}: ${error.message}`)}
}
