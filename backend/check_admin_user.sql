-- Check admin user details
SELECT id, name, email, role, created_at FROM users WHERE email = 'admin@moviebooking.com';

-- Check all users
SELECT id, name, email, role FROM users ORDER BY id; 