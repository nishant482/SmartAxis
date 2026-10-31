import { useEffect } from 'react'
import { Link } from '../lib/router'
import { useResource } from '../lib/api'
import ResourceState from '../components/ResourceState'
import NotFound from './NotFound'
import { updateMetadata } from '../lib/seo'
export default function BlogDetail({slug}){
  const resource=useResource(`/api/blogs/${encodeURIComponent(slug)}`),post=resource.data?.post
  useEffect(()=>{if(post)updateMetadata(`/blogs/${post.slug}`,{title:`${post.title} | SmartXApp Studio Blog`,description:post.excerpt,noindex:false});else if(resource.status===404)updateMetadata(`/blogs/${slug}`,{title:'Article not found | SmartXApp Studio',noindex:true})},[post,slug,resource.status])
  if(resource.status===404)return <NotFound/>
  return <section className="container blog-detail section">{!post?<><h1>Article</h1><ResourceState {...resource}/></>:<><Link to="/blogs" className="text-link">Back to articles</Link><header className="article-header"><span className="blog-category">{post.category}</span><h1>{post.title}</h1><p>{post.excerpt}</p><time dateTime={post.publishedAt}>{post.publishedAt?new Date(post.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'}):''}</time></header>{post.image&&<img className="article-cover" src={post.image} alt=""/>}<div className="article-body">{post.content.split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><div className="article-footer"><span>SmartXApp Studio</span><Link to="/blogs">More articles</Link></div></>}</section>
}
