import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    news_heading: { type: String, required: true, trim: true },
    news_content: { type: String, default: "" },
    image: { type: String, default: "" }, // base64
    alt_tag_featured: { type: String, default: "" },
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

export default mongoose.model("News", newsSchema);
