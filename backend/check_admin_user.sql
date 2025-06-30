-- Delete the admin user (if exists)
DELETE FROM users WHERE email = 'admin@moviebooking.com';

-- Re-add the admin user with default credentials
-- Password: admin123 (bcrypt hash, salt rounds 10)
INSERT INTO users (name, email, password, role) VALUES (
    'Admin User', 
    'admin@moviebooking.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'admin'
);