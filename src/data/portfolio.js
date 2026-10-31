// Project names and live URLs supplied by the owner.
// App source: https://play.google.com/store/apps/developer?id=SmartAxis
import { previews } from './previews.js'
export const developerUrl = 'https://play.google.com/store/apps/developer?id=SmartAxis'
export const ownedProjects = [
  {id:'vbike',title:'VBike',category:'Web platforms',description:'Website development for VBike, alongside a companion mobile application.',initials:'V',theme:'mint',label:'WEB + MOBILE',featured:true,capabilities:['Website development','Mobile application'],link:null},
  {id:'rajothreads',title:'RajoThreads',category:'Web platforms',description:'A website project from the SmartXApp Studio development portfolio.',initials:'rt.',theme:'sand',label:'WEBSITE',featured:true,capabilities:['Website development'],link:null},
  {id:'halox',title:'HaloX',category:'Web platforms',description:'A digital project designed and developed as part of the SmartXApp Studio portfolio.',initials:'H×',theme:'violet',label:'DIGITAL PROJECT',capabilities:['Digital development'],link:null},
  {id:'bmtindiatech',title:'BMTIndiaTech',category:'Web platforms',description:'A business website project in the SmartXApp Studio portfolio.',initials:'BMT',theme:'ice',label:'BUSINESS WEBSITE',capabilities:['Website development'],link:null},
  {id:'thlsemi',title:'THLSemi',category:'Web platforms',description:'A website development project from the SmartXApp Studio portfolio.',initials:'THL',theme:'steel',label:'WEBSITE',capabilities:['Website development'],link:null},
  {id:'vbike-mobile',title:'VBike Mobile App',category:'Mobile apps',description:'The companion mobile application developed for VBike, extending the project from web to mobile.',initials:'V',theme:'mint',label:'MOBILE APPLICATION',capabilities:['Mobile application development'],link:null},
  {id:'vbike-hrms',title:'VBike HRMS',category:'Business software',description:'The HR management system developed for VBike, part of a connected web and mobile project portfolio.',initials:'hr.',theme:'ice',label:'HR MANAGEMENT',capabilities:['Business software','HR management system'],link:'https://hr.vbike.in/'},
  {id:'vbike-dms',title:'VBike Dealer Management',category:'Business software',description:'A dealer management system developed for VBike, with role-based access for its business users.',initials:'dms.',theme:'mint',label:'DEALER MANAGEMENT',capabilities:['Dealer management system','Role-based access'],link:null},
  {id:'rajothreads-admin',title:'RajoThreads Admin',category:'Business software',description:'The administration panel developed alongside the RajoThreads website.',initials:'rt.',theme:'sand',label:'ADMINISTRATION',capabilities:['Admin panel development'],link:null},
  {id:'vbike-hr-mobile',title:'VBike HR: Attendance & Payroll',category:'Mobile apps',description:'The VBike HR mobile application for attendance and payroll, available on Google Play.',initials:'hr.',theme:'steel',label:'HR MOBILE APPLICATION',capabilities:['Mobile application development','Attendance and payroll'],link:'https://play.google.com/store/apps/details?id=com.livsmart.dealercomplaint',image:'/portfolio/apps/vbike-hr-mobile.webp'},
  {id:'vbike-backend',title:'VBike Operations Backend',category:'Business software',description:'The operations backend developed as part of the VBike project.',theme:'ice',label:'OPERATIONS SOFTWARE',capabilities:['Backend development','Business administration'],link:null},
].map((project,index)=>{
  const links={vbike:'https://vbike.in/',rajothreads:'https://rajothreads.com/',halox:'https://haloxsmart.com/',bmtindiatech:'https://www.bmtindiatech.com/',thlsemi:'https://thlsemi.com/','vbike-mobile':'https://play.google.com/store/apps/details?id=com.livsmart.vbike_app'}
  const descriptions={vbike:'An electric mobility website, with a companion mobile app and business systems developed for VBike.',halox:'A smart-home product website presenting connected switches, plugs and everyday home automation.',bmtindiatech:'A business website presenting BMT’s electronics manufacturing and product portfolio.',thlsemi:'A corporate website presenting THLSemi’s semiconductor products and business information.'}
  const presentation={
    vbike:['Electric mobility website','A product-led website for exploring electric scooters and a connected mobile experience.','mobility'],
    rajothreads:['Fashion commerce experience','An editorial storefront and a companion administration system for a fashion business.','commerce'],
    halox:['Connected home storefront','A product discovery experience for smart switches, plugs and home automation.','smart-home'],
    bmtindiatech:['Electronics manufacturing website','A business website bringing an electronics product catalogue and manufacturing capabilities together.','industry'],
    thlsemi:['Semiconductor corporate website','A corporate web experience for semiconductor products, manufacturing and company information.','industry'],
    'vbike-mobile':['Connected scooter app','Battery, BMS and GPS information in a mobile experience for electric scooter owners.','mobile'],
    'vbike-hrms':['People & HR workspace','A dedicated human resources management experience for the business.','dashboard'],
    'vbike-dms':['Dealer management platform','A role-based workspace for dealer operations.','dashboard'],
    'rajothreads-admin':['Commerce administration','An administration workspace paired with the fashion storefront.','dashboard'],
    'vbike-hr-mobile':['Attendance & payroll app','A mobile HR experience for attendance and payroll.','mobile'],
    'vbike-backend':['Business operations console','An administration backend connecting the business side of the product.','dashboard'],
  }
  const [displayTitle,summary,previewType]=presentation[project.id]
  return {...project,displayTitle,summary,previewType,preview:previews[project.id],description:descriptions[project.id]||project.description,link:links[project.id]||project.link,kind:'project',order:index,image:project.id==='vbike-mobile'?'/portfolio/apps/vbike-mobile.webp':project.image||(['rajothreads','halox'].includes(project.id)?`/portfolio/projects/${project.id}.webp`:null)}
})

export const publishedApps = [
  {id:'sanatan-wallpaper',title:'Sanatan Wallpaper: Hindu Gods',description:'A collection of Hindu devotional wallpapers for personalizing your Android home and lock screens.',packageId:'com.sanatan.hindu.wallpapers',genre:'Personalization',initials:'ॐ',theme:'saffron',featured:true},
  {id:'learn-java',title:'Learn Java & DSA Certificate',description:'Java programming and data structures learning, with examples, quizzes and course completion certificates.',packageId:'com.learn.java.programming',genre:'Education',initials:'{ J }',theme:'ice'},
  {id:'learn-flutter',title:'Learn Flutter With Certificate',description:'A Flutter learning application published by SmartXApp Studio on Google Play.',packageId:'com.flutterlearning.app',genre:'Education',initials:'F',theme:'violet'},
  {id:'fruit-drop',title:'Fruit Drop: Merge Worlds',description:'A casual fruit-merging puzzle game with colorful worlds and physics-based play.',packageId:'com.fruitdrop.juicymerge.blast',genre:'Games',initials:'◉',theme:'mint'},
  {id:'block-blast',title:'Block Blast: Block Puzzle Game',description:'A block puzzle game from the SmartXApp Studio Google Play catalogue.',packageId:'com.blockblast.colorcubeblast.game',genre:'Games',initials:'▦',theme:'violet'},
  {id:'sanatan-status',title:'Hindu Sanatan Wallpaper Status',description:'A devotional wallpaper and status application published by SmartXApp Studio.',packageId:'com.hindu.sanatan.wallpaper.status',genre:'Personalization',initials:'✺',theme:'saffron'},
  {id:'learn-python',title:'Learn Python Programming & DSA',description:'Python lessons, coding practice and data structures learning for Android.',packageId:'com.learn.python.programming',genre:'Education',theme:'ice'},
  {id:'learn-cpp',title:'Learn C++ Programming & DSA',description:'C++ programming and data structures learning with examples and practice.',packageId:'com.learncplusplus.programming',genre:'Education',theme:'violet'},
  {id:'learn-javascript',title:'Learn JavaScript & DSA',description:'JavaScript programming and data structures learning for Android.',packageId:'com.learn.javascript.programming',genre:'Education',theme:'sand'},
  {id:'aptitude-quiz',title:'Quantitative Aptitude Quiz',description:'A quantitative aptitude quiz application for practice and self-assessment.',packageId:'com.ssc.quantitativeprep',genre:'Education',theme:'mint'},
  {id:'english-grammar',title:'Learn English Grammar Test',description:'English grammar learning and test practice in a mobile application.',packageId:'com.ssc.englishprep.app',genre:'Education',theme:'ice'},
  {id:'number-puzzle',title:'Number Puzzle: Brain Games',description:'A number puzzle application for casual brain-game sessions.',packageId:'com.mindflicker.puzzle',genre:'Games',theme:'violet'},
].map((app,index)=>{
  const titles={'sanatan-wallpaper':'Devotional wallpaper collection','learn-java':'Java & DSA learning','learn-flutter':'Flutter learning experience','fruit-drop':'Fruit merge puzzle','block-blast':'Block puzzle game','sanatan-status':'Devotional status & wallpapers','learn-python':'Python & DSA learning','learn-cpp':'C++ programming practice','learn-javascript':'JavaScript learning','aptitude-quiz':'Aptitude practice','english-grammar':'English grammar practice','number-puzzle':'Number puzzle experience'}
  return {...app,displayTitle:titles[app.id],summary:app.description,previewType:'mobile',preview:previews[app.id],kind:'app',category:'Published apps',label:app.genre.toUpperCase(),image:`/portfolio/apps/${app.id}.webp`,link:`https://play.google.com/store/apps/details?id=${app.packageId}`,order:20+index}
})
export const portfolio = [...ownedProjects,...publishedApps]
export function mergePortfolio(managed=[]) {
  const records=new Map(portfolio.map(project=>[project.title.toLowerCase(),project]))
  for(const project of managed){const key=project.title.toLowerCase();records.set(key,{...records.get(key),...project})}
  return [...records.values()].sort((a,b)=>(a.order??999)-(b.order??999))
}
