import { Router } from "express";
import Contact from "../models/Contact.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET all contacts (Admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (category) {
      query.areaOfInterest = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Fetch contacts error:", err);
    res.status(500).json({ error: "Failed to fetch contact submissions" });
  }
});

// DELETE a contact (Admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

export default router;
