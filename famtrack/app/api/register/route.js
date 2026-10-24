import bcrypt from "bcryptjs";
import db from "@/lib/db";
import User from "@/models/User";
import { json, sign, setCookie } from "@/lib/auth";
export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const e = String(email || "").trim().toLowerCase(), n = String(name || "").trim(), p = String(password || "");
    if (n.length < 2) return json({ error: "Enter your full name." }, 400);
    if (!/^\S+@\S+\.\S+$/.test(e)) return json({ error: "Enter a valid email." }, 400);
    if (p.length < 8 || !/\d/.test(p) || !/[A-Za-z]/.test(p)) return json({ error: "Password needs 8+ characters with letters and numbers." }, 400);
    await db();
    if (await User.findOne({ email: e })) return json({ error: "Email already registered." }, 409);
    const u = await User.create({ name: n, email: e, password: await bcrypt.hash(p, 10) });
    await setCookie(sign(u._id));
    return json({ ok: true });
  } catch { return json({ error: "Server error." }, 500); }
}
