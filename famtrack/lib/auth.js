import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import db from "./db";
import User from "@/models/User";
export const json = (d, s = 200) => Response.json(d, { status: s });
export const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
export async function setCookie(token) {
  (await cookies()).set("ft_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export async function getUser() {
  const t = (await cookies()).get("ft_token")?.value;
  if (!t) return null;
  try { const { id } = jwt.verify(t, process.env.JWT_SECRET); await db(); return await User.findById(id); } catch { return null; }
}
