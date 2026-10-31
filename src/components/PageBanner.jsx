export default function PageBanner({eyebrow,title,accent,description,children,tone='blue'}) {
  return <section className={'page-banner banner-'+tone}>
    <div className="banner-copy">
      {eyebrow&&<div className="banner-eyebrow"><span/>{eyebrow}</div>}
      <h1>{title}{accent&&<> <em>{accent}</em></>}</h1>
      {description&&<p>{description}</p>}
      {children&&<div className="banner-actions">{children}</div>}
    </div>
    <svg className="banner-art" viewBox="0 0 320 220" fill="none" aria-hidden="true">
      <circle cx="202" cy="106" r="92" fill="currentColor" opacity=".07"/>
      <circle cx="202" cy="106" r="70" stroke="currentColor" strokeWidth="1" opacity=".2"/>
      <circle cx="202" cy="106" r="48" stroke="currentColor" strokeWidth="1" opacity=".18"/>
      <g transform="rotate(-18 165 110)"><rect x="86" y="60" width="140" height="100" rx="14" fill="white" fillOpacity=".5" stroke="currentColor" strokeOpacity=".17"/>
      <rect x="105" y="82" width="30" height="30" rx="8" fill="currentColor" opacity=".15"/>
      <path d="M149 88h53M149 99h35M105 129h97M105 139h69" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".22"/></g>
      <rect x="218" y="132" width="48" height="48" rx="13" transform="rotate(14 242 156)" fill="white" fillOpacity=".7" stroke="currentColor" strokeOpacity=".18"/>
      <circle cx="242" cy="156" r="9" stroke="currentColor" strokeWidth="2" opacity=".45"/>
      <circle cx="100" cy="39" r="5" fill="currentColor" opacity=".25"/>
    </svg>
  </section>
}
