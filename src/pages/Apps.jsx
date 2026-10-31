import { PageHero } from '../components/UI'
import AppCatalogue from '../components/AppCatalogue'
import { catalogueApps, ownedProjects } from '../data/portfolio'
const apps=[...catalogueApps,...ownedProjects.filter(app=>app.link?.includes('play.google.com/'))]
export default function Apps(){return <><PageHero number="APPS" eyebrow="THE APP COLLECTION" title="Apps for every day." accent="" description="Devotional apps, games and study material. Find your next favourite."/><section className="container section section-no-top"><AppCatalogue apps={apps} searchable/></section></>}
