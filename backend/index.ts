import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { Pool } from "pg";
import { seatLockingService } from "./services/seatLockingService";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  // Add your actual Netlify site URL below (update this in production!)
  process.env.FRONTEND_URL, // e.g. https://your-netlify-site.netlify.app
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
        callback(null, true);
      } else {
        console.warn(`CORS: Origin not allowed: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "movie_booking_db",
  password: process.env.DB_PASSWORD || "8d9a6594e6fc4135ae527daf7b2b9196",
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    } else {
      console.warn(`CORS: Origin not allowed: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Movie Booking API is running!" });
});

// Health check endpoint for deployment platforms
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Store user info in socket
  socket.on("authenticate", (userData: { userId: number; email: string }) => {
    socket.data.user = userData;
    console.log(
      `👤 User ${userData.email} (ID: ${userData.userId}) authenticated on socket ${socket.id}`,
    );
  });

  // Join a show room
  socket.on("join-show", (showId: string) => {
    socket.join(`show-${showId}`);
    console.log(`🎬 User ${socket.id} joined show ${showId}`);
  });

  // Leave a show room
  socket.on("leave-show", (showId: string) => {
    socket.leave(`show-${showId}`);
    console.log(`👋 User ${socket.id} left show ${showId}`);
  });

  // Handle seat lock request
  socket.on(
    "seat:lock",
    async (data: { seatId: number; seatNumber: string; showId: string }) => {
      try {
        const user = socket.data.user;
        if (!user) {
          socket.emit("error", "User not authenticated");
          return;
        }

        console.log(
          `🔒 Seat lock request: ${data.seatNumber} by user ${user.userId} in show ${data.showId}`,
        );

        const result = await seatLockingService.lockSeat({
          seatId: data.seatId,
          seatNumber: data.seatNumber,
          showId: data.showId,
          userId: user.userId,
          socketId: socket.id,
        });

        if (result.success) {
          // Send success response to the locking user
          socket.emit("seat:lock:success", {
            seatNumber: data.seatNumber,
            status: "locked",
            lockExpiresAt: result.seat?.lock_expires_at,
          });

          console.log(
            `✅ Seat ${data.seatNumber} locked successfully for user ${user.userId}`,
          );
        } else {
          // Send error response to the locking user
          socket.emit("seat:lock:error", {
            seatNumber: data.seatNumber,
            message: result.message,
          });

          console.log(
            `❌ Failed to lock seat ${data.seatNumber}: ${result.message}`,
          );
        }
      } catch (error) {
        console.error("❌ Error in seat:lock:", error);
        socket.emit("error", "Failed to lock seat");
      }
    },
  );

  // Handle seat unlock request
  socket.on(
    "seat:unlock",
    async (data: { seatNumber: string; showId: string }) => {
      try {
        const user = socket.data.user;
        if (!user) {
          socket.emit("error", "User not authenticated");
          return;
        }

        console.log(
          `🔓 Seat unlock request: ${data.seatNumber} by user ${user.userId} in show ${data.showId}`,
        );

        const result = await seatLockingService.unlockSeat(
          data.seatNumber,
          data.showId,
          user.userId,
          socket.id,
        );

        if (result.success) {
          // Send success response to the unlocking user
          socket.emit("seat:unlock:success", {
            seatNumber: data.seatNumber,
            status: "available",
          });

          console.log(
            `✅ Seat ${data.seatNumber} unlocked successfully by user ${user.userId}`,
          );
        } else {
          // Send error response to the unlocking user
          socket.emit("seat:unlock:error", {
            seatNumber: data.seatNumber,
            message: result.message,
          });

          console.log(
            `❌ Failed to unlock seat ${data.seatNumber}: ${result.message}`,
          );
        }
      } catch (error) {
        console.error("❌ Error in seat:unlock:", error);
        socket.emit("error", "Failed to unlock seat");
      }
    },
  );

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`🔌 User disconnected: ${socket.id}`);

    // Clean up user's locked seats
    await seatLockingService.handleUserDisconnect(socket.id);
  });
});

// Import routes
import authRoutes from "./routes/auth";
import movieRoutes from "./routes/movies";
import showRoutes from "./routes/shows";
import seatRoutes from "./routes/seats";
import bookingRoutes from "./routes/bookings";
import adminRoutes from "./routes/admin";
import paymentRoutes from "./routes/payment";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

// Error handling middleware
import { errorHandler } from "./utils/handleErrors";
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { pool, io };
