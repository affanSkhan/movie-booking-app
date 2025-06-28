-- Create admin user with proper password hash
-- Password: admin123
-- This hash was generated using bcrypt with salt rounds 10

INSERT INTO users (name, email, password, role) VALUES (
    'Admin User', 
    'admin@moviebooking.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'admin'
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role;

-- Also create a regular user for testing
INSERT INTO users (name, email, password, role) VALUES (
    'Test User', 
    'user@moviebooking.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'user'
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role; 