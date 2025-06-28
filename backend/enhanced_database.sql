-- Enhanced Movie Booking System Database Schema

-- 1. ENUM types
CREATE TYPE seat_status AS ENUM ('available', 'locked', 'booked');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 2. Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Movies table
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    poster_url TEXT,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Shows table
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    show_time TIMESTAMP NOT NULL,
    screen VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_shows_movie_id ON shows(movie_id);
CREATE INDEX idx_shows_show_time ON shows(show_time);

-- 5. Enhanced Seats table with better locking support
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    row_number INTEGER NOT NULL,
    col_number INTEGER NOT NULL,
    status seat_status NOT NULL DEFAULT 'available',
    locked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    locked_at TIMESTAMP,
    lock_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(show_id, seat_number)
);
CREATE INDEX idx_seats_show_id ON seats(show_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_seats_locked_by ON seats(locked_by);
CREATE INDEX idx_seats_lock_expires ON seats(lock_expires_at);

-- 6. Enhanced Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(255),
    order_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_show_id ON bookings(show_id);

-- 7. Booking_Seats join table
CREATE TABLE booking_seats (
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    PRIMARY KEY (booking_id, seat_id)
);
CREATE INDEX idx_booking_seats_seat_id ON booking_seats(seat_id);

-- 8. Socket session tracking for cleanup
CREATE TABLE socket_sessions (
    id SERIAL PRIMARY KEY,
    socket_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disconnected_at TIMESTAMP
);
CREATE INDEX idx_socket_sessions_user_id ON socket_sessions(user_id);
CREATE INDEX idx_socket_sessions_show_id ON socket_sessions(show_id);

-- 9. Sample admin user (password: hashed 'admin123')
INSERT INTO users (name, email, password, role) VALUES (
    'Admin', 'admin@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwO1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'admin'
);

-- 10. Function to cleanup expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
    UPDATE seats 
    SET status = 'available', 
        locked_by = NULL, 
        locked_at = NULL, 
        lock_expires_at = NULL
    WHERE status = 'locked' 
    AND lock_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 11. Trigger to automatically cleanup expired locks
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_locks()
RETURNS trigger AS $$
BEGIN
    PERFORM cleanup_expired_locks();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_expired_locks_trigger
    AFTER INSERT OR UPDATE ON seats
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_expired_locks(); 