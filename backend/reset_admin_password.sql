-- Reset admin password hash to 'Admin@123'
-- This hash was generated using bcrypt with salt rounds 10
UPDATE users
SET password = '$2b$10$walFgsM5PhhFzN/8LtP8lOoiRYjcMbuANJuOOQ7Hu4EKYinfm3FE.'
WHERE email = 'admin@m.com';

-- Also reset the other admin user
UPDATE users
SET password = '$2b$10$walFgsM5PhhFzN/8LtP8lOoiRYjcMbuANJuOOQ7Hu4EKYinfm3FE.'
WHERE email = 'admin@n.com';

-- Verify the update
SELECT id, name, email, role FROM users WHERE email IN ('admin@moviebooking.com', 'admin@example.com'); 