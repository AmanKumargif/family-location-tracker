import mongoose from "mongoose";
const c = global._ftm || (global._ftm = { conn: null, p: null });
export default async function db() {
  if (c.conn) return c.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  c.p = c.p || mongoose.connect(process.env.MONGODB_URI);
  c.conn = await c.p;
  return c.conn;
}
