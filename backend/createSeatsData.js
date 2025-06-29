const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "moviebook_db_user",
  host: process.env.DB_HOST || "dpg-d1gprebipnbc73b2bh3g-a.oregon-postgres.render.com",
  database: process.env.DB_NAME || "moviebook_db",
  password: process.env.DB_PASSWORD || "nYsi01VDlnuwPbMBu75eClVHQS3hSgri",
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: { rejectUnauthorized: false },
});

async function createSeatsData() {
  try {
    console.log("🎬 Creating seats data...");

    // First, disable the problematic trigger
    await pool.query("DROP TRIGGER IF EXISTS cleanup_expired_locks_trigger ON seats");
    console.log("✅ Disabled problematic trigger");

    // Clear existing seats
    await pool.query("DELETE FROM seats");
    console.log("🧹 Cleared existing seats");

    // Get all shows
    const showsResult = await pool.query("SELECT id FROM shows ORDER BY id");
    const shows = showsResult.rows;

    if (shows.length === 0) {
      console.log("⚠️ No shows found. Please add shows first.");
      return;
    }

    console.log(`📽️ Found ${shows.length} shows. Creating seats...`);

    // Create seats for each show
    for (const show of shows) {
      console.log(`🎫 Creating seats for show ${show.id}...`);
      
      const seats = [];
      
      // Generate 10x10 grid (A1 to J10)
      for (let row = 1; row <= 10; row++) {
        const rowLetter = String.fromCharCode(64 + row); // A=65, B=66, etc.
        
        for (let col = 1; col <= 10; col++) {
          const seatNumber = `${rowLetter}${col}`;
          seats.push([show.id, seatNumber, row, col, 'available']);
        }
      }

      // Insert all seats for this show in batches
      const batchSize = 50;
      for (let i = 0; i < seats.length; i += batchSize) {
        const batch = seats.slice(i, i + batchSize);
        const values = batch.map((_, index) => {
          const offset = i + index;
          return `($${offset * 5 + 1}, $${offset * 5 + 2}, $${offset * 5 + 3}, $${offset * 5 + 4}, $${offset * 5 + 5})`;
        }).join(', ');
        
        const flatValues = batch.flat();
        await pool.query(
          `INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES ${values}`,
          flatValues
        );
      }
      
      console.log(`✅ Created 100 seats for show ${show.id}`);
    }

    // Add some sample bookings
    console.log("📝 Adding sample bookings...");
    
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 1 AND seat_number IN ('A1', 'A2', 'A3', 'B1', 'B2', 'C1')"
    );
    
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 4 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1')"
    );
    
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 6 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2')"
    );
    
    await pool.query(
      "UPDATE seats SET status = 'booked' WHERE show_id = 8 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1')"
    );

    // Add some locked seats for testing
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
      console.log("ℹ️ Skipping locked seats (columns may not exist)");
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

createSeatsData(); 