const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "movie_booking_db",
  password: process.env.DB_PASSWORD || "8d9a6594e6fc4135ae527daf7b2b9196",
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function initDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('✅ Database connected at:', connectionTest.rows[0].now);

    console.log('🔍 Checking if tables exist...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', existingTables);

    // Check if movies table exists
    if (!existingTables.includes('movies')) {
      console.log('❌ Movies table does not exist. Creating database schema...');
      
      // Create ENUM types
      await pool.query(`
        DO $$ BEGIN
          CREATE TYPE seat_status AS ENUM ('available', 'selected', 'booked');
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

      console.log('✅ Database schema created successfully');
    } else {
      console.log('✅ Movies table exists');
    }

    // Check if there are movies in the database
    const moviesCount = await pool.query('SELECT COUNT(*) FROM movies');
    console.log(`📊 Movies in database: ${moviesCount.rows[0].count}`);

    if (parseInt(moviesCount.rows[0].count) === 0) {
      console.log('📽️ Adding sample movies data...');
      
      await pool.query(`
        INSERT INTO movies (title, description, poster_url, duration) VALUES
        ('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 152),
        ('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 148),
        ('Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 169),
        ('The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 142),
        ('Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 154)
      `);

      console.log('✅ Sample movies added successfully');

      // Add some shows
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
      `);

      console.log('✅ Sample shows added successfully');
    }

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
