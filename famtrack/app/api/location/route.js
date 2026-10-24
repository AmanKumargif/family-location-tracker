import db from "@/lib/db";
import Family from "@/models/Family";
import Location from "@/models/Location";
import { getUser, json } from "@/lib/auth";
export async function POST(req) {
  try {
    const u = await getUser();
    if (!u) return json({ error: "Not signed in." }, 401);
    const { lat, lng, accuracy } = await req.json();
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return json({ error: "Invalid coordinates." }, 400);
    await Location.findOneAndUpdate({ userId: u._id }, { lat, lng, accuracy: Number.isFinite(accuracy) ? accuracy : 0, updatedAt: new Date() }, { upsert: true });
    return json({ ok: true });
  } catch { return json({ error: "Server error." }, 500); }
}
export async function GET(req) {
  try {
    const u = await getUser();
    if (!u) return json({ error: "Not signed in." }, 401);
    const id = new URL(req.url).searchParams.get("familyId");
    const f = await Family.findOne({ _id: id, members: u._id }).populate("members", "name");
    if (!f) return json({ error: "Not a member of this family." }, 403);
    const ls = await Location.find({ userId: { $in: f.members.map((m) => m._id) } });
    const by = Object.fromEntries(ls.map((l) => [String(l.userId), l]));
    return json({ members: f.members.map((m) => { const l = by[String(m._id)]; return { id: String(m._id), name: m.name, lat: l?.lat ?? null, lng: l?.lng ?? null, accuracy: l?.accuracy ?? null, updatedAt: l?.updatedAt ?? null }; }) });
  } catch { return json({ error: "Server error." }, 500); }
}
