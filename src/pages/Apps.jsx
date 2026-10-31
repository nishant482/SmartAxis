import { PageHero } from '../components/UI'
import AppCatalogue from '../components/AppCatalogue'
import { catalogueApps, ownedProjects } from '../data/portfolio'
const apps=[...catalogueApps,...ownedProjects.filter(app=>app.link?.includes('play.google.com/'))]
export default function Apps(){return <><PageHero number="APPS" eyebrow="THE APP COLLECTION" title="Something for every day." accent="Find your kind of app." description="Explore Sanatan bhakti and devotional content, games, study material and more. Every app opens directly on Google Play."/><section className="container section section-no-top"><AppCatalogue apps={apps} searchable/></section></>}
