import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messagesRoutes from "./routes/messagesRoute.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 8000;

// Use  routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
