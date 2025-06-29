-- Comprehensive Seats Data for Movie Booking System (Fixed Version)
-- This script creates a 10x10 seat grid (A1 to J10) for all shows

-- First, disable the problematic trigger temporarily
DROP TRIGGER IF EXISTS cleanup_expired_locks_trigger ON seats;

-- Clear existing seats to avoid duplicates
DELETE FROM seats;

-- Function to generate seats for a show
CREATE OR REPLACE FUNCTION generate_seats_for_show(show_id INTEGER)
RETURNS void AS $$
DECLARE
    row_letter CHAR(1);
    col_num INTEGER;
    seat_number VARCHAR(10);
    row_num INTEGER;
BEGIN
    -- Generate 10x10 grid (A1 to J10)
    FOR row_num IN 1..10 LOOP
        row_letter := CHR(64 + row_num); -- A=65, B=66, etc.
        
        FOR col_num IN 1..10 LOOP
            seat_number := row_letter || col_num::VARCHAR;
            
            INSERT INTO seats (show_id, seat_number, row_number, col_number, status)
            VALUES (show_id, seat_number, row_num, col_num, 'available');
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate seats for all shows
SELECT generate_seats_for_show(id) FROM shows ORDER BY id;

-- Drop the function after use
DROP FUNCTION generate_seats_for_show(INTEGER);

-- Add some sample bookings to make the data more realistic
-- Book some seats for show 1 (The Dark Knight 14:00)
UPDATE seats SET status = 'booked' WHERE show_id = 1 AND seat_number IN ('A1', 'A2', 'A3', 'B1', 'B2', 'C1');

-- Book some seats for show 4 (Inception 15:00)
UPDATE seats SET status = 'booked' WHERE show_id = 4 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1');

-- Book some seats for show 6 (Interstellar 16:00)
UPDATE seats SET status = 'booked' WHERE show_id = 6 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2');

-- Book some seats for show 8 (The Shawshank Redemption 13:00)
UPDATE seats SET status = 'booked' WHERE show_id = 8 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1');

-- Add some locked seats for testing (only if locked_by column exists)
UPDATE seats SET 
    status = 'locked',
    locked_by = 1,
    locked_at = NOW(),
    lock_expires_at = NOW() + INTERVAL '5 minutes'
WHERE show_id = 2 AND seat_number IN ('A1', 'A2', 'B1');

-- Recreate the trigger (but with better logic to avoid infinite loops)
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_locks()
RETURNS trigger AS $$
BEGIN
    -- Only run cleanup if we're not in a transaction that's already cleaning up
    IF NOT EXISTS (
        SELECT 1 FROM pg_stat_activity 
        WHERE query LIKE '%cleanup_expired_locks%' 
        AND pid != pg_backend_pid()
    ) THEN
        PERFORM cleanup_expired_locks();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_expired_locks_trigger
    AFTER INSERT OR UPDATE ON seats
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_expired_locks();

-- Show summary
SELECT 
    show_id,
    COUNT(*) as total_seats,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as available_seats,
    COUNT(CASE WHEN status = 'booked' THEN 1 END) as booked_seats,
    COUNT(CASE WHEN status = 'locked' THEN 1 END) as locked_seats
FROM seats 
GROUP BY show_id 
ORDER BY show_id; 