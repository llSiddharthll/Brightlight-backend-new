import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/setup — create first admin (only if no users exist)
router.post("/setup", async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0)
      return res.status(403).json({ error: "Admin already exists" });

    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const user = await User.create({ username, password });
    res.status(201).json({ message: "Admin created", username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — verify token
router.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

export default router;
