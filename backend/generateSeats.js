const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "dpg-d1gprebipnbc73b2bh3g-a",
  database: process.env.DB_NAME || "moviebook_db",
  password: process.env.DB_PASSWORD || "nYsi01VDlnuwPbMBu75eClVHQS3hSgri",
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function createComprehensiveSeats() {
  try {
    console.log("🎬 Creating comprehensive seats data...");

    // First, get all shows
    const showsResult = await pool.query("SELECT id FROM shows ORDER BY id");
    const shows = showsResult.rows;

    if (shows.length === 0) {
      console.log("⚠️ No shows found in database. Please add shows first.");
      return;
    }

    console.log(`📽️ Found ${shows.length} shows. Creating seats for each...`);

    // Clear existing seats to avoid duplicates
    await pool.query("DELETE FROM seats");
    console.log("🧹 Cleared existing seats");

    // Generate seats for each show
    for (const show of shows) {
      console.log(`🎫 Creating seats for show ${show.id}...`);
      
      // Generate 10x10 grid (A1 to J10)
      for (let row = 1; row <= 10; row++) {
        const rowLetter = String.fromCharCode(64 + row); // A=65, B=66, etc.
        
        for (let col = 1; col <= 10; col++) {
          const seatNumber = `${rowLetter}${col}`;
          
          await pool.query(
            "INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES ($1, $2, $3, $4, $5)",
            [show.id, seatNumber, row, col, "available"]
          );
        }
      }
      
      console.log(`✅ Created 100 seats for show ${show.id}`);
    }

    // Add some sample bookings to make the data more realistic
    console.log("📝 Adding sample bookings...");

    // Book some seats for show 1 (The Dark Knight 14:00)
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 1 AND seat_number IN ('A1', 'A2', 'A3', 'B1', 'B2', 'C1')"
    );

    // Book some seats for show 4 (Inception 15:00)
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 4 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1')"
    );

    // Book some seats for show 6 (Interstellar 16:00)
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 6 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2')"
    );

    // Book some seats for show 8 (The Shawshank Redemption 13:00)
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 8 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1')"
    );

    // Add some locked seats for testing (only if locked_by column exists)
    try {
      await pool.query(`
        UPDATE seats SET 
          status = 'locked',
          locked_by = 1,
          locked_at = NOW(),
          lock_expires_at = NOW() + INTERVAL '5 minutes'
        WHERE show_id = 2 AND seat_number IN ('A1', 'A2', 'B1')
      `);
      console.log("🔒 Added some locked seats for testing");
    } catch (error) {
      console.log("ℹ️ Skipping locked seats (columns may not exist yet)");
    }

    // Show summary
    const summaryResult = await pool.query(`
      SELECT 
        show_id,
        COUNT(*) as total_seats,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_seats,
        COUNT(CASE WHEN status = 'booked' THEN 1 END) as booked_seats,
        COUNT(CASE WHEN status = 'locked' THEN 1 END) as locked_seats
      FROM seats 
      GROUP BY show_id 
      ORDER BY show_id
    `);

    console.log("\n📊 Seats Summary:");
    console.log("Show ID | Total | Available | Booked | Locked");
    console.log("--------|-------|-----------|--------|-------");
    
    summaryResult.rows.forEach(row => {
      console.log(`${row.show_id.toString().padStart(7)} | ${row.total_seats.toString().padStart(5)} | ${row.available_seats.toString().padStart(9)} | ${row.booked_seats.toString().padStart(6)} | ${row.locked_seats.toString().padStart(6)}`);
    });

    const totalSeats = summaryResult.rows.reduce((sum, row) => sum + parseInt(row.total_seats), 0);
    console.log(`\n🎉 Successfully created ${totalSeats} seats across ${shows.length} shows!`);

  } catch (error) {
    console.error("❌ Error creating seats:", error);
  } finally {
    await pool.end();
  }
}

createComprehensiveSeats(); 