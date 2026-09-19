import { Button, Eyebrow } from '../components/UI'
export default function NotFound() {
  return <section className="container not-found"><Eyebrow>404 / A SLIGHT DETOUR</Eyebrow><h1>Let’s find<br/>your way <span>back.</span></h1><p>This page isn’t here. Your next possibility might be.</p><Button to="/">Back to the homepage</Button></section>
}
