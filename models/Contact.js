import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    areaOfInterest: { type: String, trim: true },
    residencyStatus: { type: String, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "archived"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
