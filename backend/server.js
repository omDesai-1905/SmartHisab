import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import authenticateToken from "./src/user/middlewares/authMiddleware.js";
import connectDB from "./src/connection/mongoConnection.js";
import authRoutes from "./src/user/routes/authRoutes.js";
import customerRoutes from "./src/user/routes/customerRoutes.js";
import supplierRoutes from "./src/user/routes/supplierRoutes.js";
import cashbookRoutes from "./src/user/routes/cashbookRoutes.js";
import adminRoutes from "./src/admin/routes/adminRoutes.js";
import messageRoutes from "./src/user/routes/messageRoutes.js";
import customerMessageRoutes from "./src/user/routes/customerMessageRoutes.js";
import customerPortalRoutes from "./src/customer/routes/customerPortalRoutes.js";
import chatRoutes from "./src/user/routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/customers", authenticateToken, customerRoutes);
app.use("/api/suppliers", authenticateToken, supplierRoutes);
app.use("/api/cashbook", authenticateToken, cashbookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", authenticateToken, customerMessageRoutes);
app.use("/api/user", authenticateToken, chatRoutes);
app.use("/api/customer-portal", customerPortalRoutes);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io/",
});

// Store active connections
const userSockets = new Map(); // userId -> socketId
const customerSockets = new Map(); // customerId -> socketId

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userType = socket.handshake.auth.userType; // 'user' or 'customer'

  if (!token) {
    return next(new Error("Authentication token required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userType = userType;
    socket.userId = decoded.userId || decoded.customerId;
    socket.decoded = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`${socket.userType} connected: ${socket.userId}`);

  // Register user/customer socket
  if (socket.userType === "user") {
    userSockets.set(socket.userId, socket.id);
  } else if (socket.userType === "customer") {
    customerSockets.set(socket.userId, socket.id);

    // Join a room with their associated user (business owner)
    if (socket.decoded.userId) {
      socket.join(`user_${socket.decoded.userId}`);
    }
  }

  // Handle sending a message
  socket.on("send_message", async (data) => {
    try {
      const {
        recipientId,
        recipientType,
        message,
        customerId,
        customerName,
        userId,
        userEmail,
      } = data;

      // Create message object
      const messageData = {
        ...data,
        senderId: socket.userId,
        senderType: socket.userType,
        timestamp: new Date(),
        isRead: false,
      };

      // Emit to recipient
      if (recipientType === "user") {
        const recipientSocketId = userSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receive_message", messageData);
        }
      } else if (recipientType === "customer") {
        const recipientSocketId = customerSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receive_message", messageData);
        }
      }

      // Send confirmation back to sender
      socket.emit("message_sent", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", { error: error.message });
    }
  });

  // Handle message read status
  socket.on("mark_read", (data) => {
    const { messageId, recipientId, recipientType } = data;

    if (recipientType === "user") {
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message_read", { messageId });
      }
    } else if (recipientType === "customer") {
      const recipientSocketId = customerSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message_read", { messageId });
      }
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { recipientId, recipientType, isTyping } = data;

    if (recipientType === "user") {
      const recipientSocketId = userSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user_typing", {
          userId: socket.userId,
          userType: socket.userType,
          isTyping,
        });
      }
    } else if (recipientType === "customer") {
      const recipientSocketId = customerSockets.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user_typing", {
          userId: socket.userId,
          userType: socket.userType,
          isTyping,
        });
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`${socket.userType} disconnected: ${socket.userId}`);

    if (socket.userType === "user") {
      userSockets.delete(socket.userId);
    } else if (socket.userType === "customer") {
      customerSockets.delete(socket.userId);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server is running`);
});

export { io };
export default app;
