import { v2 as cloudinary } from "cloudinary";
import { Router } from "express";
import multer from "multer";
import Blog from "../models/Blog.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload Buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "Brightlight Immigration" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// Helper: Scan HTML for base64 images and upload to Cloudinary
const processContentImages = async (content) => {
  if (!content) return content;
  const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
  let newContent = content;
  const matches = [...content.matchAll(base64Regex)];
  
  for (const m of matches) {
    const base64Data = m[1];
    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: "Brightlight Immigration/Content"
      });
      newContent = newContent.replace(base64Data, result.secure_url);
    } catch (err) {
      console.error("Cloudinary content image upload failed:", err.message);
    }
  }
  return newContent;
};

function makeSlug(heading) {
  return heading.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-");
}

// GET /api/blogs — list all (lightweight by default)
router.get("/", async (req, res) => {
  try {
    // Select only metadata by default to prevent 504 timeouts and JSON parse errors
    // Note: 'image' is now allowed back in by default as it is a small URL, not a huge base64
    let selection = "blog_heading date custom_url tag_1 tag_2 tag_3 alt_tag image";
    
    if (req.query.content === "true") selection += " blog_content";
    if (req.query.full === "true") selection = ""; // all fields

    const blogs = await Blog.find().select(selection).sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blogs/:slug — get by slug
router.get("/:slug", async (req, res) => {
  // ... existing slug logic ...
  try {
    const { slug } = req.params;
    let blog = await Blog.findOne({ custom_url: slug });
    if (!blog && slug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(slug);
    }
    if (!blog) {
      const allTitles = await Blog.find({}, "blog_heading _id").lean();
      const target = allTitles.find(b => makeSlug(b.blog_heading) === slug);
      if (target) {
        blog = await Blog.findById(target._id);
      }
    }
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blogs — create (auth required)
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = await uploadToCloudinary(req.file.buffer);
    }
    // Process images embedded in blog_content HTML
    if (data.blog_content) {
      data.blog_content = await processContentImages(data.blog_content);
    }
    const blog = await Blog.create(data);
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/blogs/:id — update (auth required)
router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = await uploadToCloudinary(req.file.buffer);
    }
    // Process images embedded in blog_content HTML
    if (data.blog_content) {
      data.blog_content = await processContentImages(data.blog_content);
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/blogs/:id — delete (auth required)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
