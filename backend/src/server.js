import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/authRoutes.js";
import messagesRoutes from "./routes/messagesRoute.js";
import connectDB from "./lib/db.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import profileRoutes from "./routes/profileRoute.js";
import cookieParser from "cookie-parser";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set");
  process.exit(1);
}

const app = express();

// Get the directory name of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
// Rate limiting
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/messages", messagesRoutes);
app.use("/api/profile", profileRoutes);

// Serve the built frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../../frontend/dist");

  app.use(express.static(frontendPath));

  app.get("/{*path}", (_, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start the server
const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  });
