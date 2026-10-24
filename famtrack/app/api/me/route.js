import { getUser, json } from "@/lib/auth";
export async function GET() {
  const u = await getUser();
  if (!u) return json({ error: "Not signed in." }, 401);
  return json({ id: String(u._id), name: u.name, email: u.email });
}
