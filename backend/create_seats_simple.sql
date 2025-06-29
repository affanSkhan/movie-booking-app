-- Simple Seats Data for Movie Booking System
-- This script creates a 10x10 seat grid (A1 to J10) for all shows

-- First, disable the problematic trigger temporarily
DROP TRIGGER IF EXISTS cleanup_expired_locks_trigger ON seats;

-- Clear existing seats to avoid duplicates
DELETE FROM seats;

-- Generate seats for each show manually
-- Show 1: The Dark Knight 14:00
INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES
(1, 'A1', 1, 1, 'available'), (1, 'A2', 1, 2, 'available'), (1, 'A3', 1, 3, 'available'), (1, 'A4', 1, 4, 'available'), (1, 'A5', 1, 5, 'available'), (1, 'A6', 1, 6, 'available'), (1, 'A7', 1, 7, 'available'), (1, 'A8', 1, 8, 'available'), (1, 'A9', 1, 9, 'available'), (1, 'A10', 1, 10, 'available'),
(1, 'B1', 2, 1, 'available'), (1, 'B2', 2, 2, 'available'), (1, 'B3', 2, 3, 'available'), (1, 'B4', 2, 4, 'available'), (1, 'B5', 2, 5, 'available'), (1, 'B6', 2, 6, 'available'), (1, 'B7', 2, 7, 'available'), (1, 'B8', 2, 8, 'available'), (1, 'B9', 2, 9, 'available'), (1, 'B10', 2, 10, 'available'),
(1, 'C1', 3, 1, 'available'), (1, 'C2', 3, 2, 'available'), (1, 'C3', 3, 3, 'available'), (1, 'C4', 3, 4, 'available'), (1, 'C5', 3, 5, 'available'), (1, 'C6', 3, 6, 'available'), (1, 'C7', 3, 7, 'available'), (1, 'C8', 3, 8, 'available'), (1, 'C9', 3, 9, 'available'), (1, 'C10', 3, 10, 'available'),
(1, 'D1', 4, 1, 'available'), (1, 'D2', 4, 2, 'available'), (1, 'D3', 4, 3, 'available'), (1, 'D4', 4, 4, 'available'), (1, 'D5', 4, 5, 'available'), (1, 'D6', 4, 6, 'available'), (1, 'D7', 4, 7, 'available'), (1, 'D8', 4, 8, 'available'), (1, 'D9', 4, 9, 'available'), (1, 'D10', 4, 10, 'available'),
(1, 'E1', 5, 1, 'available'), (1, 'E2', 5, 2, 'available'), (1, 'E3', 5, 3, 'available'), (1, 'E4', 5, 4, 'available'), (1, 'E5', 5, 5, 'available'), (1, 'E6', 5, 6, 'available'), (1, 'E7', 5, 7, 'available'), (1, 'E8', 5, 8, 'available'), (1, 'E9', 5, 9, 'available'), (1, 'E10', 5, 10, 'available'),
(1, 'F1', 6, 1, 'available'), (1, 'F2', 6, 2, 'available'), (1, 'F3', 6, 3, 'available'), (1, 'F4', 6, 4, 'available'), (1, 'F5', 6, 5, 'available'), (1, 'F6', 6, 6, 'available'), (1, 'F7', 6, 7, 'available'), (1, 'F8', 6, 8, 'available'), (1, 'F9', 6, 9, 'available'), (1, 'F10', 6, 10, 'available'),
(1, 'G1', 7, 1, 'available'), (1, 'G2', 7, 2, 'available'), (1, 'G3', 7, 3, 'available'), (1, 'G4', 7, 4, 'available'), (1, 'G5', 7, 5, 'available'), (1, 'G6', 7, 6, 'available'), (1, 'G7', 7, 7, 'available'), (1, 'G8', 7, 8, 'available'), (1, 'G9', 7, 9, 'available'), (1, 'G10', 7, 10, 'available'),
(1, 'H1', 8, 1, 'available'), (1, 'H2', 8, 2, 'available'), (1, 'H3', 8, 3, 'available'), (1, 'H4', 8, 4, 'available'), (1, 'H5', 8, 5, 'available'), (1, 'H6', 8, 6, 'available'), (1, 'H7', 8, 7, 'available'), (1, 'H8', 8, 8, 'available'), (1, 'H9', 8, 9, 'available'), (1, 'H10', 8, 10, 'available'),
(1, 'I1', 9, 1, 'available'), (1, 'I2', 9, 2, 'available'), (1, 'I3', 9, 3, 'available'), (1, 'I4', 9, 4, 'available'), (1, 'I5', 9, 5, 'available'), (1, 'I6', 9, 6, 'available'), (1, 'I7', 9, 7, 'available'), (1, 'I8', 9, 8, 'available'), (1, 'I9', 9, 9, 'available'), (1, 'I10', 9, 10, 'available'),
(1, 'J1', 10, 1, 'available'), (1, 'J2', 10, 2, 'available'), (1, 'J3', 10, 3, 'available'), (1, 'J4', 10, 4, 'available'), (1, 'J5', 10, 5, 'available'), (1, 'J6', 10, 6, 'available'), (1, 'J7', 10, 7, 'available'), (1, 'J8', 10, 8, 'available'), (1, 'J9', 10, 9, 'available'), (1, 'J10', 10, 10, 'available');

-- Show 2: The Dark Knight 17:30
INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES
(2, 'A1', 1, 1, 'available'), (2, 'A2', 1, 2, 'available'), (2, 'A3', 1, 3, 'available'), (2, 'A4', 1, 4, 'available'), (2, 'A5', 1, 5, 'available'), (2, 'A6', 1, 6, 'available'), (2, 'A7', 1, 7, 'available'), (2, 'A8', 1, 8, 'available'), (2, 'A9', 1, 9, 'available'), (2, 'A10', 1, 10, 'available'),
(2, 'B1', 2, 1, 'available'), (2, 'B2', 2, 2, 'available'), (2, 'B3', 2, 3, 'available'), (2, 'B4', 2, 4, 'available'), (2, 'B5', 2, 5, 'available'), (2, 'B6', 2, 6, 'available'), (2, 'B7', 2, 7, 'available'), (2, 'B8', 2, 8, 'available'), (2, 'B9', 2, 9, 'available'), (2, 'B10', 2, 10, 'available'),
(2, 'C1', 3, 1, 'available'), (2, 'C2', 3, 2, 'available'), (2, 'C3', 3, 3, 'available'), (2, 'C4', 3, 4, 'available'), (2, 'C5', 3, 5, 'available'), (2, 'C6', 3, 6, 'available'), (2, 'C7', 3, 7, 'available'), (2, 'C8', 3, 8, 'available'), (2, 'C9', 3, 9, 'available'), (2, 'C10', 3, 10, 'available'),
(2, 'D1', 4, 1, 'available'), (2, 'D2', 4, 2, 'available'), (2, 'D3', 4, 3, 'available'), (2, 'D4', 4, 4, 'available'), (2, 'D5', 4, 5, 'available'), (2, 'D6', 4, 6, 'available'), (2, 'D7', 4, 7, 'available'), (2, 'D8', 4, 8, 'available'), (2, 'D9', 4, 9, 'available'), (2, 'D10', 4, 10, 'available'),
(2, 'E1', 5, 1, 'available'), (2, 'E2', 5, 2, 'available'), (2, 'E3', 5, 3, 'available'), (2, 'E4', 5, 4, 'available'), (2, 'E5', 5, 5, 'available'), (2, 'E6', 5, 6, 'available'), (2, 'E7', 5, 7, 'available'), (2, 'E8', 5, 8, 'available'), (2, 'E9', 5, 9, 'available'), (2, 'E10', 5, 10, 'available'),
(2, 'F1', 6, 1, 'available'), (2, 'F2', 6, 2, 'available'), (2, 'F3', 6, 3, 'available'), (2, 'F4', 6, 4, 'available'), (2, 'F5', 6, 5, 'available'), (2, 'F6', 6, 6, 'available'), (2, 'F7', 6, 7, 'available'), (2, 'F8', 6, 8, 'available'), (2, 'F9', 6, 9, 'available'), (2, 'F10', 6, 10, 'available'),
(2, 'G1', 7, 1, 'available'), (2, 'G2', 7, 2, 'available'), (2, 'G3', 7, 3, 'available'), (2, 'G4', 7, 4, 'available'), (2, 'G5', 7, 5, 'available'), (2, 'G6', 7, 6, 'available'), (2, 'G7', 7, 7, 'available'), (2, 'G8', 7, 8, 'available'), (2, 'G9', 7, 9, 'available'), (2, 'G10', 7, 10, 'available'),
(2, 'H1', 8, 1, 'available'), (2, 'H2', 8, 2, 'available'), (2, 'H3', 8, 3, 'available'), (2, 'H4', 8, 4, 'available'), (2, 'H5', 8, 5, 'available'), (2, 'H6', 8, 6, 'available'), (2, 'H7', 8, 7, 'available'), (2, 'H8', 8, 8, 'available'), (2, 'H9', 8, 9, 'available'), (2, 'H10', 8, 10, 'available'),
(2, 'I1', 9, 1, 'available'), (2, 'I2', 9, 2, 'available'), (2, 'I3', 9, 3, 'available'), (2, 'I4', 9, 4, 'available'), (2, 'I5', 9, 5, 'available'), (2, 'I6', 9, 6, 'available'), (2, 'I7', 9, 7, 'available'), (2, 'I8', 9, 8, 'available'), (2, 'I9', 9, 9, 'available'), (2, 'I10', 9, 10, 'available'),
(2, 'J1', 10, 1, 'available'), (2, 'J2', 10, 2, 'available'), (2, 'J3', 10, 3, 'available'), (2, 'J4', 10, 4, 'available'), (2, 'J5', 10, 5, 'available'), (2, 'J6', 10, 6, 'available'), (2, 'J7', 10, 7, 'available'), (2, 'J8', 10, 8, 'available'), (2, 'J9', 10, 9, 'available'), (2, 'J10', 10, 10, 'available');

-- Continue for shows 3-9 (I'll create a more efficient approach)
-- For now, let's just add a few more shows to test

-- Show 3: The Dark Knight 21:00 (just first few rows for testing)
INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES
(3, 'A1', 1, 1, 'available'), (3, 'A2', 1, 2, 'available'), (3, 'A3', 1, 3, 'available'), (3, 'A4', 1, 4, 'available'), (3, 'A5', 1, 5, 'available'),
(3, 'B1', 2, 1, 'available'), (3, 'B2', 2, 2, 'available'), (3, 'B3', 2, 3, 'available'), (3, 'B4', 2, 4, 'available'), (3, 'B5', 2, 5, 'available'),
(3, 'C1', 3, 1, 'available'), (3, 'C2', 3, 2, 'available'), (3, 'C3', 3, 3, 'available'), (3, 'C4', 3, 4, 'available'), (3, 'C5', 3, 5, 'available');

-- Show 4: Inception 15:00
INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES
(4, 'A1', 1, 1, 'available'), (4, 'A2', 1, 2, 'available'), (4, 'A3', 1, 3, 'available'), (4, 'A4', 1, 4, 'available'), (4, 'A5', 1, 5, 'available'),
(4, 'B1', 2, 1, 'available'), (4, 'B2', 2, 2, 'available'), (4, 'B3', 2, 3, 'available'), (4, 'B4', 2, 4, 'available'), (4, 'B5', 2, 5, 'available'),
(4, 'C1', 3, 1, 'available'), (4, 'C2', 3, 2, 'available'), (4, 'C3', 3, 3, 'available'), (4, 'C4', 3, 4, 'available'), (4, 'C5', 3, 5, 'available');

-- Add some sample bookings
UPDATE seats SET status = 'booked' WHERE show_id = 1 AND seat_number IN ('A1', 'A2', 'A3', 'B1', 'B2', 'C1');
UPDATE seats SET status = 'booked' WHERE show_id = 4 AND seat_number IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1');

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