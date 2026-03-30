import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import Blog from "./models/Blog.js";
import News from "./models/News.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const uploadBase64 = async (base64String, folder) => {
      try {
        const result = await cloudinary.uploader.upload(base64String, { folder });
        return result.secure_url;
      } catch (err) {
        console.error("\nCloudinary upload failed:", err.message);
        return null;
      }
    };

    const processContent = async (content, folder) => {
      if (!content) return content;
      // Find all base64 data URIs in src attributes
      const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
      let match;
      let newContent = content;
      const matches = [...content.matchAll(base64Regex)];
      
      if (matches.length > 0) {
        console.log(`\n  Found ${matches.length} embedded images in content.`);
        for (const m of matches) {
          const fullMatch = m[0];
          const base64Data = m[1];
          process.stdout.write("  Uploading embedded image... ");
          const url = await uploadBase64(base64Data, folder);
          if (url) {
            newContent = newContent.replace(base64Data, url);
            console.log("Done.");
          } else {
            console.log("Failed.");
          }
        }
      }
      return newContent;
    };

    // --- Migrate Blogs ---
    console.log("\nChecking Blogs...");
    const blogs = await Blog.find();
    for (const blog of blogs) {
      let updated = false;
      
      // 1. Featured Image
      if (blog.image && blog.image.startsWith("data:image")) {
        console.log(`Migrating featured image for: ${blog.blog_heading}`);
        const url = await uploadBase64(blog.image, "Brightlight Immigration");
        if (url) {
          blog.image = url;
          updated = true;
        }
      }

      // 2. Images inside HTML content
      const newContent = await processContent(blog.blog_content, "Brightlight Immigration/Content");
      if (newContent !== blog.blog_content) {
        blog.blog_content = newContent;
        updated = true;
      }

      if (updated) {
        await blog.save();
        console.log(`Updated blog: ${blog.blog_heading}`);
      }
    }

    // --- Migrate News ---
    console.log("\nChecking News...");
    const allNews = await News.find();
    for (const item of allNews) {
      let updated = false;
      
      // 1. Featured Image
      if (item.image && item.image.startsWith("data:image")) {
        console.log(`Migrating featured image for news: ${item.news_heading}`);
        const url = await uploadBase64(item.image, "Brightlight Immigration");
        if (url) {
          item.image = url;
          updated = true;
        }
      }

      // 2. Images inside HTML content
      const newContent = await processContent(item.news_content, "Brightlight Immigration/Content");
      if (newContent !== item.news_content) {
        item.news_content = newContent;
        updated = true;
      }

      if (updated) {
        await item.save();
        console.log(`Updated news: ${item.news_heading}`);
      }
    }

    console.log("\nMigration finished.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrateImages();
