import { Router } from "express";
import multer from "multer";
import Blog from "../models/Blog.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function makeSlug(heading) {
  return heading.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-");
}

// GET /api/blogs — list all
router.get("/", async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blogs/:slug — get by slug (custom_url or generated)
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    // Try custom_url first, then match generated slug from heading
    let blog = await Blog.findOne({ custom_url: slug });
    if (!blog) {
      // Find by generated slug from heading
      const all = await Blog.find();
      blog = all.find(
        (b) => makeSlug(b.blog_heading) === slug || b._id.toString() === slug
      );
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
      const b64 = req.file.buffer.toString("base64");
      data.image = `data:${req.file.mimetype};base64,${b64}`;
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
      const b64 = req.file.buffer.toString("base64");
      data.image = `data:${req.file.mimetype};base64,${b64}`;
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
