import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { Pool } from "pg";
import { seatLockingService } from "./services/seatLockingService";
import { verifyJWT } from "./utils/generateJWT";

// Load environment variables
dotenv.config();

// Log environment info for debugging
console.log('🔧 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL
});

const app = express();
const server = createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://movie-booking-pf.netlify.app", // Production frontend URL
  process.env.FRONTEND_URL, // e.g. https://your-netlify-site.netlify.app
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  },
});

// Database connection
const pool = new Pool(
  process.env.DATABASE_URL ? 
  // Use DATABASE_URL if provided (Render's preferred method)
  {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10,
    statement_timeout: 60000,
  } :
  // Fallback to individual environment variables
  {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "movie_booking_db",
    password: process.env.DB_PASSWORD || "8d9a6594e6fc4135ae527daf7b2b9196",
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10,
    statement_timeout: 60000,
  }
);

// Add connection error handling
pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Test initial database connection
pool.on('connect', () => {
  console.log('✅ Database pool connected');
});

console.log('🔧 Database config:', {
  usingDatabaseUrl: !!process.env.DATABASE_URL,
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost", 
  database: process.env.DB_NAME || "movie_booking_db",
  port: process.env.DB_PORT || "5432",
  ssl: process.env.NODE_ENV === "production"
});

// Middleware - Simplified CORS for better compatibility
app.use(cors({
  origin: true, // Allow all origins in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
  optionsSuccessStatus: 200
}));

// Additional explicit CORS headers
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Max-Age', '3600');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS preflight for ${req.url} from origin: ${req.headers.origin}`);
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());

// Add request logging for debugging
app.use((req: any, res: any, next: any) => {
  console.log(`📝 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

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

// Database health check endpoint
app.get("/api/db-health", async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    res.json({ 
      status: "database connected", 
      timestamp: new Date().toISOString(),
      database_time: result.rows[0].current_time,
      database_version: result.rows[0].db_version
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: "database error", 
      error: error.message 
    });
  }
});

// Check if movies table exists
app.get("/api/tables-check", async (req: any, res: any) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    res.json({ 
      status: "success", 
      tables: result.rows.map((row: any) => row.table_name)
    });
  } catch (error: any) {
    console.error('Tables check error:', error);
    res.status(500).json({ 
      status: "error", 
      error: error.message 
    });
  }
});

// Initialize database endpoint (admin only - use with caution)
app.post("/api/init-database", async (req: any, res: any) => {
  try {
    const { adminKey } = req.body;
    
    // Simple protection - you can set this in environment variables
    if (adminKey !== process.env.ADMIN_INIT_KEY && adminKey !== 'moviebook_admin_2025') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('🚀 Starting database initialization...');
    
    // Create enum types
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE seat_status AS ENUM ('available', 'locked', 'booked');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        poster_url TEXT,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shows (
        id SERIAL PRIMARY KEY,
        movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        show_time TIMESTAMP NOT NULL,
        screen VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        seat_number VARCHAR(10) NOT NULL,
        row_number INTEGER NOT NULL,
        col_number INTEGER NOT NULL,
        status seat_status NOT NULL DEFAULT 'available',
        locked_at TIMESTAMP,
        locked_by_user_id INTEGER,
        locked_by_socket_id VARCHAR(255),
        lock_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(show_id, seat_number)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        status booking_status NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_seats (
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
        PRIMARY KEY (booking_id, seat_id)
      )
    `);

    // Create admin user
    await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES (
        'Admin User', 
        'admin@moviebooking.com', 
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
        'admin'
      ) ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        role = EXCLUDED.role
    `);

    // Add sample movies
    await pool.query(`
      INSERT INTO movies (title, description, poster_url, duration) VALUES
      ('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 152),
      ('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 148),
      ('Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 169),
      ('The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 142),
      ('Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 154)
      ON CONFLICT DO NOTHING
    `);

    // Add shows
    await pool.query(`
      INSERT INTO shows (movie_id, show_time, screen) VALUES
      (1, '2025-08-05 14:00:00', 'Screen 1'),
      (1, '2025-08-05 17:30:00', 'Screen 1'),
      (1, '2025-08-05 21:00:00', 'Screen 1'),
      (2, '2025-08-05 15:00:00', 'Screen 2'),
      (2, '2025-08-05 18:30:00', 'Screen 2'),
      (3, '2025-08-05 16:00:00', 'Screen 3'),
      (3, '2025-08-05 19:30:00', 'Screen 3'),
      (4, '2025-08-05 13:00:00', 'Screen 4'),
      (4, '2025-08-05 16:30:00', 'Screen 4')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Database initialization completed successfully!');
    
    res.json({ 
      status: "success", 
      message: "Database initialized successfully with sample data" 
    });
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error);
    res.status(500).json({ 
      status: "error", 
      error: error.message 
    });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  // JWT authentication in handshake
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.emit("error", "Authentication token required");
    socket.disconnect();
    return;
  }
  try {
    const user = verifyJWT(token);
    socket.data.user = user;
    console.log(`👤 User ${user.email} (ID: ${user.userId}) authenticated on socket ${socket.id}`);
  } catch (err) {
    socket.emit("error", "Invalid or expired token");
    socket.disconnect();
    return;
  }

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
      const user = socket.data.user;
      if (!user) {
        socket.emit("error", "User not authenticated");
        socket.disconnect();
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
    },
  );

  // Handle seat unlock request
  socket.on(
    "seat:unlock",
    async (data: { seatNumber: string; showId: string }) => {
      const user = socket.data.user;
      if (!user) {
        socket.emit("error", "User not authenticated");
        socket.disconnect();
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

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', result.rows[0].current_time);
    
    // Check if movies table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'movies'
      )
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Movies table exists');
      const movieCount = await pool.query('SELECT COUNT(*) FROM movies');
      console.log(`📊 Movies in database: ${movieCount.rows[0].count}`);
    } else {
      console.log('❌ Movies table does not exist - database may need initialization');
    }
  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
  }
}

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testDatabaseConnection();
});

export { pool, io };
