"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MapView from "@/components/MapView";
const HAS_KEY = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const ago = (t) => { const s = Math.round((Date.now() - new Date(t)) / 1000); return s < 10 ? "just now" : s < 60 ? s + "s ago" : s < 3600 ? Math.round(s / 60) + " min ago" : Math.round(s / 3600) + " h ago"; };
const stat = (m, sharingNow) => { if (!m.updatedAt) return ["Not sharing yet", ""]; const a = (Date.now() - new Date(m.updatedAt)) / 1000; return a < 120 ? ["Sharing location", "b-live"] : a < 900 ? ["Last seen recently", ""] : ["Location stale", "b-stale"]; };
const api = async (url, body) => { const r = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined); let d = {}; try { d = await r.json(); } catch {} return { ok: r.ok, status: r.status, ...d }; };
export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null), [fams, setFams] = useState(null), [fid, setFid] = useState(""), [tab, setTab] = useState("map");
  const [mem, setMem] = useState([]), [sync, setSync] = useState(null), [focus, setFocus] = useState(null);
  const [sharing, setSharing] = useState(false), [smsg, setSmsg] = useState(""), [cn, setCn] = useState(""), [jc, setJc] = useState(""), [msg, setMsg] = useState(""), [copied, setCopied] = useState("");
  const watch = useRef(null), last = useRef(0), busy = useRef(false);
  const loadFams = useCallback(async (pick) => {
    const d = await api("/api/family");
    if (d.status === 401) return router.push("/login");
    setFams(d.families || []);
    setFid((cur) => pick || (d.families?.some((f) => f.id === cur) ? cur : d.families?.[0]?.id || ""));
    if (!(d.families || []).length) setTab("family");
  }, [router]);
  useEffect(() => { (async () => { const m = await api("/api/me"); if (m.status === 401) return router.push("/login"); setMe(m); loadFams(); })(); }, [router, loadFams]);
  useEffect(() => {
    if (!fid) { setMem([]); return; }
    let on = true;
    const pull = async () => { if (busy.current || document.hidden) return; busy.current = true; const d = await api("/api/location?familyId=" + fid); busy.current = false; if (on && d.members) { setMem(d.members); setSync(new Date()); } };
    pull(); const t = setInterval(pull, 8000);
    return () => { on = false; clearInterval(t); };
  }, [fid]);
  const stop = useCallback(() => { if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); watch.current = null; setSharing(false); }, []);
  useEffect(() => stop, [stop]);
  function toggle() {
    if (sharing) { stop(); setSmsg("Sharing is off. Your last position stays visible with its timestamp."); return; }
    if (!navigator.geolocation) return setSmsg("Geolocation is not supported in this browser.");
    setSmsg("Waiting for browser permission…");
    watch.current = navigator.geolocation.watchPosition(async (p) => {
      if (Date.now() - last.current < 5000) return; last.current = Date.now();
      const r = await api("/api/location", { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
      setSmsg(r.ok ? "Sharing your location with all your families." : r.error || "Could not update location.");
    }, (e) => { setSmsg(e.code === 1 ? "Permission denied. Allow location in your browser settings." : "Location unavailable right now."); stop(); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    setSharing(true);
  }
  async function act(body, after) { setMsg(""); const d = await api("/api/family", body); if (!d.ok) return setMsg(d.error || "Failed."); after && after(d); await loadFams(d.id); }
  async function out() { stop(); await api("/api/logout", {}); router.push("/"); router.refresh(); }
  async function copy(c) { try { await navigator.clipboard.writeText(c); setCopied(c); setTimeout(() => setCopied(""), 1500); } catch {} }
  if (!me || !fams) return <div className="wrap"><p style={{ padding: 40 }}>Loading…</p></div>;
  const fam = fams.find((f) => f.id === fid);
  const pts = mem.filter((m) => m.lat != null).map((m) => ({ ...m, ago: ago(m.updatedAt) }));
  const live = mem.filter((m) => m.updatedAt && Date.now() - new Date(m.updatedAt) < 120000).length;
  return (<div className="wrap">
    <nav><Link className="logo" href="/"><i />FamTrack</Link><div className="links"><span>Hi, {me.name}</span><button className="btn" onClick={out}>Log out</button></div></nav>
    <div className="top"><div><h2>{fam ? fam.name : "Your families"}</h2>{fam && <span>Invite code <span className="code">{fam.code}</span> <button className="btn" style={{ minHeight: 30, padding: "2px 10px" }} onClick={() => copy(fam.code)}>{copied === fam.code ? "Copied" : "Copy"}</button></span>}</div>
      {fams.length > 0 && <div style={{ minWidth: 200 }}><label htmlFor="fs" style={{ margin: 0 }}>Active family</label><select id="fs" value={fid} onChange={(e) => setFid(e.target.value)}>{fams.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>}</div>
    <div className="tabs"><button className={"btn " + (tab === "map" ? "on" : "")} onClick={() => setTab("map")}>Map</button><button className={"btn " + (tab === "family" ? "on" : "")} onClick={() => setTab("family")}>Family</button></div>
    {tab === "map" && fam && <>
      <div className="stats"><div className="card"><b>{mem.length}</b><span>Members</span></div><div className="card"><b>{live}</b><span>Sharing now</span></div><div className="card"><b>{sync ? sync.toLocaleTimeString() : "—"}</b><span>Last sync</span></div><div className="card"><b>{fams.length}</b><span>Your families</span></div></div>
      <div className="card" style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}><div><b>Location sharing</b><div style={{ color: "var(--mu)", fontSize: 13 }}>{smsg || "Off. We ask for browser permission only when you turn it on."}</div></div><button className="btn p" onClick={toggle}>{sharing ? "Stop sharing" : "Start sharing"}</button></div>
      <div className="split">{HAS_KEY ? (pts.length ? <MapView points={pts} focus={focus} /> : <div className="mapbox">Nobody has shared a location yet.</div>) : <div className="mapbox">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local and restart to see the map.</div>}
        <div className="card"><b>Members</b>{mem.map((m) => { const [s, c] = stat(m); return (<div className="mem" key={m.id}><div className="av">{m.name.slice(0, 2).toUpperCase()}</div><div><b>{m.name}{m.id === me.id ? " (you)" : ""}</b><small>{m.updatedAt ? "Updated " + ago(m.updatedAt) : "No location yet"}</small></div><span className={"badge " + c}>{s}</span>{m.lat != null && <button className="btn" style={{ minHeight: 30, padding: "2px 8px" }} onClick={() => setFocus({ ...m, k: Date.now() })}>Focus</button>}</div>); })}</div></div></>}
    {tab === "family" && <div className="grid">
      <div style={{ gridColumn: "1/-1" }}>{fams.map((f) => (<div className="card" style={{ marginBottom: 12 }} key={f.id}><div className="top" style={{ padding: 0 }}><div><h3>{f.name}</h3><span>Code <span className="code">{f.code}</span> <button className="btn" style={{ minHeight: 28, padding: "1px 10px" }} onClick={() => copy(f.code)}>{copied === f.code ? "Copied" : "Copy"}</button></span></div><div><button className="btn" onClick={() => { setFid(f.id); setTab("map"); }}>Open map</button> <button className="btn" onClick={() => confirm("Leave " + f.name + "?") && act({ action: "leave", familyId: f.id })}>Leave</button></div></div>
        <p style={{ marginTop: 8 }}>Members: {f.members.map((m) => m.name + (m.id === f.createdBy ? " (admin)" : "")).join(", ")}</p></div>))}
        {!fams.length && <div className="card"><p>You are not in any family yet. Create one or join with a code.</p></div>}</div>
      <div className="card"><h3>Create a new family</h3><label htmlFor="cn">Family name</label><input id="cn" value={cn} onChange={(e) => setCn(e.target.value)} placeholder="e.g. Sharma Family" /><br /><br /><button className="btn p" onClick={() => act({ action: "create", name: cn }, () => { setCn(""); setTab("map"); })}>Create family</button></div>
      <div className="card"><h3>Join another family</h3><label htmlFor="jc">Invitation code</label><input id="jc" value={jc} onChange={(e) => setJc(e.target.value)} placeholder="ABCD-2345" style={{ textTransform: "uppercase" }} /><br /><br /><button className="btn p" onClick={() => act({ action: "join", code: jc }, () => { setJc(""); setTab("map"); })}>Join family</button></div>
      <div className="err" style={{ gridColumn: "1/-1" }} role="alert">{msg}</div></div>}
  </div>);
}
