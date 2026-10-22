import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
