export const appCategories=[
  {id:'sanatan',label:'Sanatan Bhakti & Devotional',description:'Bhakti, devotional wallpapers and spiritual content.'},
  {id:'games',label:'Games',description:'Puzzles, casual play and games currently in testing.'},
  {id:'study',label:'Study Material',description:'Programming, exam preparation and everyday learning.'},
  {id:'other',label:'More Apps',description:'More personalization and mobile experiences.'},
]
export const blogCategoryDefaults=['Sanatan Bhakti & Devotional','Games','Study Material','Studio Updates']
export function appCategory(app){
  if(app.appCategory)return app.appCategory
  if(['sanatan-wallpaper','sanatan-status','shiva-wallpapers'].includes(app.id))return 'sanatan'
  if(app.genre==='Games')return 'games'
  if(app.genre==='Education')return 'study'
  return 'other'
}
