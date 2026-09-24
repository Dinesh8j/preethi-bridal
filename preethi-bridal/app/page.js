import { site } from '../lib/config';
import { getWorks, getTestimonials, getSite } from '../lib/store';
import Gallery from './Gallery';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const [works, reviews, img] = await Promise.all([getWorks().catch(() => []), getTestimonials().catch(() => []), getSite().catch(() => ({ hero: null, about: null }))]);
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi Preethi, I would like to book bridal makeup.')}`;
  const ig = `https://instagram.com/${site.instagram}`;
  return (<>
    <nav><a className="logo" href="#top">{site.name}</a>
      <div><a href="#about">About</a><a href="#services">Services</a><a href="#works">Portfolio</a><a href="#reviews">Reviews</a><a className="pill" href={wa} target="_blank">Book Now</a></div></nav>

    <header id="top" className="hero" style={img.hero ? { backgroundImage: `linear-gradient(90deg,#2a1218cc,#2a121855),url(${img.hero})` } : undefined}>
      <div className="hero-in"><span className="eyebrow">Bridal Makeup Artist · {site.location}</span>
        <h1>{site.name}</h1><p>{site.tagline}</p>
        <a className="btn" href={wa} target="_blank">Book on WhatsApp</a><a className="btn ghost" href={ig} target="_blank">Instagram</a></div>
    </header>

    <section id="about" className="split">
      <div className="frame">{img.about ? <img src={img.about} alt="Preethi, bridal makeup artist" /> : <div className="ph">Preethi</div>}</div>
      <div><span className="eyebrow dark">About me</span><h2>Making every bride feel like herself, only more radiant</h2><p>{site.about}</p>
        <a className="btn" href={wa} target="_blank">Let's talk</a></div>
    </section>

    <section id="services" className="tint"><div className="wrap"><span className="eyebrow dark c">What I do</span><h2 className="c">Services</h2>
      <div className="grid">{site.services.map(([t, d], i) => <div className="card" key={t}><small>0{i + 1}</small><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>

    <section id="works" className="wrap"><span className="eyebrow dark c">Portfolio</span><h2 className="c">Recent Works</h2>
      {works.length ? <Gallery works={works} /> : <p className="c">Photos coming soon.</p>}
      <p className="c"><a className="btn ghost dk" href={ig} target="_blank">See more on Instagram</a></p></section>

    <section id="reviews" className="dark-sec"><div className="wrap"><span className="eyebrow c">Kind words</span><h2 className="c">Happy Brides</h2>
      {reviews.length ? <div className="grid">{reviews.map(r => <div className="review" key={r.id}><p>“{r.text}”</p><b>{r.name}</b></div>)}</div> : <p className="c">Reviews coming soon.</p>}</div></section>

    <footer><h2>Book your date</h2><p>{site.location}</p>
      <a className="btn" href={wa} target="_blank">WhatsApp</a><a className="btn ghost dk" href={ig} target="_blank">@{site.instagram}</a>
      <small>© {new Date().getFullYear()} {site.name}</small>
      <small className="credit">Website created by <a href="https://jay-solutions.vercel.app/" target="_blank" rel="noopener"><b>JAY Solutions</b></a> — we help you grow your business. Contact us: <a href="tel:+916380783948">6380783948</a></small></footer>
    <a className="wa" href={wa} target="_blank" aria-label="WhatsApp">WhatsApp</a>
  </>);
}
