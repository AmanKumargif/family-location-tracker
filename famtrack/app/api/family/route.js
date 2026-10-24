import crypto from "crypto";
import db from "@/lib/db";
import Family from "@/models/Family";
import { getUser, json } from "@/lib/auth";
const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const mk = () => { const b = crypto.randomBytes(8); let s = ""; for (const x of b) s += A[x % A.length]; return s.slice(0, 4) + "-" + s.slice(4); };
const shape = (f) => ({ id: String(f._id), name: f.name, code: f.code, createdBy: String(f.createdBy), members: f.members.map((m) => ({ id: String(m._id), name: m.name })) });
export async function GET() {
  const u = await getUser();
  if (!u) return json({ error: "Not signed in." }, 401);
  const fs = await Family.find({ members: u._id }).populate("members", "name").sort({ createdAt: 1 });
  return json({ families: fs.map(shape) });
}
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return json({ error: "Not signed in." }, 401);
    const { action, name, code, familyId } = await req.json();
    if (action === "create") {
      const n = String(name || "").trim();
      if (n.length < 2 || n.length > 60) return json({ error: "Enter a family name (2–60 characters)." }, 400);
      for (let i = 0; i < 5; i++) {
        try { const f = await Family.create({ name: n, code: mk(), createdBy: u._id, members: [u._id] }); return json({ ok: true, id: String(f._id) }); }
        catch (e) { if (e.code !== 11000) throw e; }
      }
      return json({ error: "Could not generate a code, try again." }, 500);
    }
    if (action === "join") {
      const c = String(code || "").trim().toUpperCase();
      const f = await Family.findOne({ code: c });
      if (!f) return json({ error: "Invalid invitation code." }, 404);
      if (f.members.some((m) => String(m) === String(u._id))) return json({ error: "You are already in this family." }, 409);
      f.members.push(u._id); await f.save();
      return json({ ok: true, id: String(f._id) });
    }
    if (action === "leave") {
      const f = await Family.findOne({ _id: familyId, members: u._id });
      if (!f) return json({ error: "Family not found." }, 404);
      f.members = f.members.filter((m) => String(m) !== String(u._id));
      if (!f.members.length) await f.deleteOne();
      else { if (String(f.createdBy) === String(u._id)) f.createdBy = f.members[0]; await f.save(); }
      return json({ ok: true });
    }
    return json({ error: "Unknown action." }, 400);
  } catch { return json({ error: "Server error." }, 500); }
}
