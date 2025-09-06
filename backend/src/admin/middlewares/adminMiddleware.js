import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticateAdmin;
