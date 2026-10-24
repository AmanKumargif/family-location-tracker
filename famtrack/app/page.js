import Link from "next/link";
const F = [["Live location sharing", "Share your position after you allow browser permission. Stop anytime."], ["Multiple families", "Join your own family, in-laws or friends, each as a separate group."], ["Invitation codes", "Random codes to invite relatives. No code, no entry."], ["Privacy first", "Last-updated times are shown honestly, so stale spots never look live."]];
export default function Home() {
  return (<div className="wrap">
    <nav><Link className="logo" href="/"><i />FamTrack</Link><div className="links"><a href="#features">Features</a><a href="#how">How It Works</a><a href="#privacy">Privacy</a><Link href="/login">Login</Link><Link className="btn p" href="/register">Get Started</Link></div></nav>
    <div className="hero"><h1>Your Family, Closer Than Ever.</h1><p>Consent-based family location sharing. Everyone chooses when to share, and only your family groups can see it.</p><Link className="btn p" href="/register">Get Started</Link> <a className="btn" href="#features">Explore Features</a></div>
    <section className="s" id="features"><h2>Features</h2><div className="grid">{F.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <section className="s" id="how"><h2>How it works</h2><div className="grid">{["Create an account", "Create or join families", "Share on the map"].map((t, i) => <div className="card" key={t}><span className="badge">Step {i + 1}</span><h3 style={{ marginTop: 8 }}>{t}</h3></div>)}</div></section>
    <section className="s" id="privacy"><h2>Privacy and security</h2><div className="card"><p>Passwords are hashed with bcrypt. Sessions use HTTP-only cookies. Every location request checks family membership on the server. Location is shared only while the page is open and sharing is on. Updates refresh every few seconds; this is polling, not WebSockets.</p></div></section>
    <footer>FamTrack · contact: hello@example.com (placeholder)</footer>
  </div>);
}
