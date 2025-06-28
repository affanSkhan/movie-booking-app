-- Reset admin password hash to 'admin123'
-- This hash was generated using bcrypt with salt rounds 10
UPDATE users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@moviebooking.com';

-- Also reset the other admin user
UPDATE users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@example.com';

-- Verify the update
SELECT id, name, email, role FROM users WHERE email IN ('admin@moviebooking.com', 'admin@example.com'); 