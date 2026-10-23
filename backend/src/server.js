import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/authRoutes.js";
import messagesRoutes from "./routes/messagesRoute.js";
import connectDB from "./lib/db.js";

import profileRoutes from "./routes/profileRoute.js";
import {
  profileBodyLimit,
  profileTooLargeMessage,
} from "./controllers/profileController.js";
import cookieParser from "cookie-parser";
import { arcjetProtect } from "./middleware/arcjetMiddleware.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set");
  process.exit(1);
}

if (!process.env.ARCJET_KEY) {
  console.error("ARCJET_KEY is not set");
  process.exit(1);
}

const app = express();

// Get the directory name of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const jsonParser = express.json({ limit: "100kb" });
const profileJsonParser = express.json({ limit: profileBodyLimit });

app.use("/api/profile", profileJsonParser);
app.use(jsonParser);
app.use(cookieParser());

// Arcjet protection for API routes only, so static files are not counted
app.use("/api", arcjetProtect);

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

app.use((err, req, res, next) => {
  if (err.type !== "entity.too.large") {
    return next(err);
  }

  const message = req.originalUrl.startsWith("/api/profile")
    ? profileTooLargeMessage
    : "Request body is too large";

  res.status(413).json({ message });
});

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
