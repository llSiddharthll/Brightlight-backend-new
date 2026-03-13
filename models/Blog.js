import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    blog_heading: { type: String, required: true, trim: true },
    blog_content: { type: String, default: "" },
    image: { type: String, default: "" }, // base64 string
    alt_tag: { type: String, default: "" },
    tag_1: { type: String, default: "" },
    tag_2: { type: String, default: "" },
    tag_3: { type: String, default: "" },
    custom_url: { type: String, default: "" },
    url: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
