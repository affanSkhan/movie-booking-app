const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "dpg-d1gprebipnbc73b2bh3g-a",
  database: process.env.DB_NAME || "moviebook_db",
  password: process.env.DB_PASSWORD || "nYsi01VDlnuwPbMBu75eClVHQS3hSgri",
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: isProduction ? { rejectUnauthorized: false } : false,  // Correct for Render
});

async function updateDatabaseSchema() {
  try {
    console.log("🔧 Updating database schema...");

    // 1. Update seat_status enum
    console.log("📝 Updating seat_status enum...");
    const currentValues = await pool.query(
      "SELECT unnest(enum_range(NULL::seat_status)) as current_values"
    );
    console.log(
      "Current enum values:",
      currentValues.rows.map((row) => row.current_values)
    );

    const lockedExists = currentValues.rows.some(
      (row) => row.current_values === "locked"
    );

    if (!lockedExists) {
      await pool.query("ALTER TYPE seat_status ADD VALUE 'locked'");
      console.log('✅ Added "locked" to seat_status enum');
    } else {
      console.log('ℹ️ "locked" already exists in seat_status enum');
    }

    // 2. Add missing columns to seats table
    console.log("📝 Adding missing columns to seats table...");

    const columnExists = async (col) => {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'seats' AND column_name = $1
      `, [col]);
      return result.rows.length > 0;
    };

    if (!(await columnExists("locked_by"))) {
      await pool.query(
        "ALTER TABLE seats ADD COLUMN locked_by INTEGER REFERENCES users(id)"
      );
      console.log("✅ Added locked_by column to seats table");
    } else {
      console.log("ℹ️ locked_by column already exists");
    }

    if (!(await columnExists("lock_expires_at"))) {
      await pool.query(
        "ALTER TABLE seats ADD COLUMN lock_expires_at TIMESTAMP"
      );
      console.log("✅ Added lock_expires_at column to seats table");
    } else {
      console.log("ℹ️ lock_expires_at column already exists");
    }

    // 3. Create indexes
    console.log("📝 Creating indexes...");
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_seats_locked_by ON seats(locked_by)"
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_seats_lock_expires ON seats(lock_expires_at)"
    );
    console.log("✅ Indexes created");

    // 4. Clean up expired locks
    console.log("🧹 Cleaning up expired locks...");
    const cleanupResult = await pool.query(`
      UPDATE seats 
      SET status = 'available', 
          locked_by = NULL, 
          locked_at = NULL, 
          lock_expires_at = NULL 
      WHERE status = 'locked' AND lock_expires_at < NOW()
    `);
    console.log(`✅ Cleaned up ${cleanupResult.rowCount} expired locks`);

    // 5. Verify table structure
    console.log("📋 Verifying table structure...");
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'seats' 
      ORDER BY ordinal_position
    `);
    tableStructure.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    // 6. Final enum check
    const updatedValues = await pool.query(
      "SELECT unnest(enum_range(NULL::seat_status)) as updated_values"
    );
    console.log(
      "Updated enum values:",
      updatedValues.rows.map((row) => row.updated_values)
    );

    console.log("✅ Database schema updated successfully!");
  } catch (error) {
    console.error("❌ Error updating database schema:", error);
  } finally {
    await pool.end();
  }
}

updateDatabaseSchema();
