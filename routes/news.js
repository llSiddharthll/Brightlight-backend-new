import { Router } from "express";
import multer from "multer";
import News from "../models/News.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function makeSlug(heading) {
  return heading.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-");
}

// GET /api/news
router.get("/", async (_req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/news/:slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    let item = await News.findOne({ custom_url: slug });
    if (!item) {
      const all = await News.find();
      item = all.find(
        (n) => makeSlug(n.news_heading) === slug || n._id.toString() === slug
      );
    }
    if (!item) return res.status(404).json({ error: "News not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/news
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      data.image = `data:${req.file.mimetype};base64,${b64}`;
    }
    const item = await News.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/news/:id
router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      data.image = `data:${req.file.mimetype};base64,${b64}`;
    }
    const item = await News.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: "News not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/news/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const item = await News.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "News not found" });
    res.json({ message: "News deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
