import mongoose from "mongoose";
const S = new mongoose.Schema({ name: { type: String, required: true, trim: true }, code: { type: String, required: true, unique: true }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] }, { timestamps: true });
export default mongoose.models.Family || mongoose.model("Family", S);
