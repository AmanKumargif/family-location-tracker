"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AuthForm({ mode }) {
  const r = useRouter(), reg = mode === "register";
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); if (busy) return; setErr("");
    if (reg && f.password !== f.confirm) return setErr("Passwords do not match.");
    setBusy(true);
    try {
      const res = await fetch("/api/" + mode, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await res.json();
      if (!res.ok) setErr(d.error || "Something went wrong."); else { r.push("/dashboard"); r.refresh(); }
    } catch { setErr("Network error. Try again."); }
    setBusy(false);
  }
  return (<div className="wrap"><nav><Link className="logo" href="/"><i />FamTrack</Link></nav>
    <form className="card auth" onSubmit={submit}><h2>{reg ? "Create your account" : "Welcome back"}</h2>
      {reg && <><label htmlFor="n">Full name</label><input id="n" value={f.name} onChange={set("name")} autoComplete="name" required /></>}
      <label htmlFor="e">Email</label><input id="e" type="email" value={f.email} onChange={set("email")} autoComplete="email" required />
      <label htmlFor="p">Password</label><input id="p" type={show ? "text" : "password"} value={f.password} onChange={set("password")} autoComplete={reg ? "new-password" : "current-password"} required />
      {reg && <><label htmlFor="c">Confirm password</label><input id="c" type={show ? "text" : "password"} value={f.confirm} onChange={set("confirm")} required /></>}
      <label style={{ fontWeight: 400 }}><input type="checkbox" style={{ width: "auto" }} checked={show} onChange={() => setShow(!show)} /> Show password</label>
      <div className="err" role="alert">{err}</div>
      <button className="btn p" style={{ width: "100%" }} disabled={busy}>{busy ? "Please wait…" : reg ? "Register" : "Log in"}</button>
      <p style={{ textAlign: "center" }}>{reg ? <>Have an account? <Link href="/login">Log in</Link></> : <>New here? <Link href="/register">Register</Link></>}</p>
    </form></div>);
}
