import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import blogsRouter from "./routes/blogs.js";
import newsRouter from "./routes/news.js";
import emailRouter from "./routes/email.js";
import contactsRouter from "./routes/contacts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
        "https://www.brightlightimmigration.ca",
        "https://brightlightimmigration.ca",
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/news", newsRouter);
app.use("/api/email", emailRouter);
app.use("/api/contacts", contactsRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// 404
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// Connect DB then start server
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/brightlight")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
