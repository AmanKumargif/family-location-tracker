import { cookies } from "next/headers";
import { json } from "@/lib/auth";
export async function POST() { (await cookies()).delete("ft_token"); return json({ ok: true }); }
