import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authenticateToken from "./src/user/middlewares/authMiddleware.js";
import connectDB from "./src/connection/mongoConnection.js";
import authRoutes from "./src/user/routes/authRoutes.js";
import customerRoutes from "./src/user/routes/customerRoutes.js";
import cashbookRoutes from "./src/user/routes/cashbookRoutes.js";
import adminRoutes from "./src/admin/routes/adminRoutes.js";
import messageRoutes from "./src/user/routes/messageRoutes.js";
import customerMessageRoutes from "./src/user/routes/customerMessageRoutes.js";
import customerPortalRoutes from "./src/customer/routes/customerPortalRoutes.js";

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
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", authenticateToken, customerMessageRoutes);
app.use("/api/customer-portal", customerPortalRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
