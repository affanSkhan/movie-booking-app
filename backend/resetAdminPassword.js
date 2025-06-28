const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'movie_booking_db',
  password: process.env.DB_PASSWORD || '8d9a6594e6fc4135ae527daf7b2b9196',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetAdminPassword() {
  try {
    console.log('🔧 Resetting admin password...');
    
    // Generate new password hash for 'admin123'
    const saltRounds = 10;
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('Generated hash for password "admin123":', hashedPassword);
    
    // Update admin user password
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, name, email, role',
      [hashedPassword, 'admin@moviebooking.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('Updated user:', result.rows[0]);
      console.log('New credentials:');
      console.log('  Email: admin@moviebooking.com');
      console.log('  Password: admin123');
    } else {
      console.log('❌ Admin user not found. Creating new admin user...');
      
      // Create admin user if it doesn't exist
      const createResult = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        ['Admin User', 'admin@moviebooking.com', hashedPassword, 'admin']
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('Created user:', createResult.rows[0]);
      console.log('Credentials:');
      console.log('  Email: admin@moviebooking.com');
      console.log('  Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await pool.end();
  }
}

resetAdminPassword(); 