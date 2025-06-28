const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'movie_booking_db',
  password: process.env.DB_PASSWORD || '8d9a6594e6fc4135ae527daf7b2b9196',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user in database...');
    
    // Check admin user
    const adminResult = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE email = 'admin@moviebooking.com'"
    );
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log('✅ Admin user found:');
      console.log('   ID:', admin.id);
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Created:', admin.created_at);
      
      // Check if role is correct
      if (admin.role === 'admin') {
        console.log('✅ Role is correct (admin)');
      } else {
        console.log('❌ Role is incorrect:', admin.role);
        console.log('   Expected: admin');
        console.log('   Found:', admin.role);
      }
    } else {
      console.log('❌ Admin user not found!');
    }
    
    // Check all users
    console.log('\n📋 All users in database:');
    const allUsersResult = await pool.query(
      'SELECT id, name, email, role FROM users ORDER BY id'
    );
    
    allUsersResult.rows.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await pool.end();
  }
}

checkAdminUser(); 