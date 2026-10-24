import bcrypt from "bcryptjs";
import db from "@/lib/db";
import User from "@/models/User";
import { json, sign, setCookie } from "@/lib/auth";
export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await db();
    const u = await User.findOne({ email: String(email || "").trim().toLowerCase() });
    if (!u || !(await bcrypt.compare(String(password || ""), u.password))) return json({ error: "Invalid email or password." }, 401);
    await setCookie(sign(u._id));
    return json({ ok: true });
  } catch { return json({ error: "Server error." }, 500); }
}
