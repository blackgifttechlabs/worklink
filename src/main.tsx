import { createRoot } from 'react-dom/client';
import './styles.css';

const appUrl = (import.meta.env.VITE_SERVICE_LOOP_APP_URL || 'https://service-linker-delta.vercel.app').replace(/\/$/, '');
const enterApp = () => window.location.assign(`${appUrl}/home`);

function App() {
  return <main>
    <nav className="nav" aria-label="Main navigation">
      <a className="brand" href="#top" aria-label="Service Loop home"><span className="brand-mark">↻</span>Service Loop</a>
      <div className="nav-links"><a href="#how-it-works">How it works</a><a href="#services">Services</a><a href="mailto:hello@serviceloop.co.zw">Contact</a></div>
      <button className="nav-enter" onClick={enterApp}>Enter Service Loop <span>→</span></button>
    </nav>

    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">BUILT FOR ZIMBABWE</p>
        <h1>Find trusted people for the work that matters.</h1>
        <p className="lead">Service Loop connects you with local providers, jobs, and services in one straightforward marketplace.</p>
        <div className="actions"><button className="primary" onClick={enterApp}>Enter Service Loop <span>→</span></button><a className="secondary" href="#how-it-works">See how it works</a></div>
        <p className="note">Already a member? Enter Service Loop to continue.</p>
      </div>
      <div className="hero-card" aria-label="A trusted local services network">
        <div className="pin">↻</div><div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="mini-card first"><b>Verified providers</b><small>People you can trust</small></div>
        <div className="mini-card second"><b>Local opportunities</b><small>Work close to home</small></div>
        <div className="mini-card third"><b>One clear loop</b><small>Search · Connect · Work</small></div>
      </div>
    </section>

    <section className="steps" id="how-it-works"><p className="eyebrow">HOW IT WORKS</p><h2>A better way to get work done locally.</h2><div className="step-grid">
      <article><span>01</span><h3>Search</h3><p>Browse services, providers, jobs, and local offers.</p></article>
      <article><span>02</span><h3>Connect</h3><p>Find the right person and start a direct conversation.</p></article>
      <article><span>03</span><h3>Get it done</h3><p>Keep your next project moving with confidence.</p></article>
    </div></section>

    <section className="services" id="services"><div><p className="eyebrow">FOR EVERYDAY WORK</p><h2>From a quick repair to your next big build.</h2></div><div className="service-list"><span>Construction & trades</span><span>Home & property</span><span>Transport & logistics</span><span>Technology & creative</span><span>Care & education</span><span>Business services</span></div></section>

    <section className="closing"><p className="eyebrow">READY WHEN YOU ARE</p><h2>Make the right local connection.</h2><button className="primary" onClick={enterApp}>Enter Service Loop <span>→</span></button></section>
    <footer><a className="brand" href="#top"><span className="brand-mark">↻</span>Service Loop</a><span>Zimbabwe’s local services marketplace</span><a href="mailto:hello@serviceloop.co.zw">hello@serviceloop.co.zw</a></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
