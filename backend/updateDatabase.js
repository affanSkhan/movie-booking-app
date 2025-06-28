const { Pool } = require("pg");
require("dotenv").config();

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

async function updateSeatStatusEnum() {
  try {
    console.log("🔧 Updating seat_status enum...");

    // First, check current enum values
    const currentValues = await pool.query(
      "SELECT unnest(enum_range(NULL::seat_status)) as current_values",
    );
    console.log(
      "Current enum values:",
      currentValues.rows.map((row) => row.current_values),
    );

    // Check if 'locked' already exists
    const lockedExists = currentValues.rows.some(
      (row) => row.current_values === "locked",
    );

    if (!lockedExists) {
      // Add 'locked' to the enum
      await pool.query("ALTER TYPE seat_status ADD VALUE 'locked'");
      console.log('✅ Added "locked" to seat_status enum');
    } else {
      console.log('ℹ️ "locked" already exists in seat_status enum');
    }

    // Verify the updated enum values
    const updatedValues = await pool.query(
      "SELECT unnest(enum_range(NULL::seat_status)) as updated_values",
    );
    console.log(
      "Updated enum values:",
      updatedValues.rows.map((row) => row.updated_values),
    );

    console.log("✅ Database schema updated successfully!");
  } catch (error) {
    console.error("❌ Error updating database schema:", error);
  } finally {
    await pool.end();
  }
}

updateSeatStatusEnum();
