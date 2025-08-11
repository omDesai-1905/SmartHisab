import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authenticateToken from "./src/middlewares/authMiddleware.js";
import connectDB from "./src/connection/mongoConnection.js";
import authRoutes from "./src/routes/authRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import cashbookRoutes from "./src/routes/cashbookRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/customers", authenticateToken, customerRoutes);
app.use("/api/cashbook", authenticateToken, cashbookRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
