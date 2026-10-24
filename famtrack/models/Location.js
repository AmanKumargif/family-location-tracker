import mongoose from "mongoose";
const S = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true }, lat: { type: Number, min: -90, max: 90, required: true }, lng: { type: Number, min: -180, max: 180, required: true }, accuracy: Number, updatedAt: { type: Date, default: Date.now } });
export default mongoose.models.Location || mongoose.model("Location", S);
