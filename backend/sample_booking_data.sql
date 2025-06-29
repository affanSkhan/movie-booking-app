-- Sample Booking Data for Admin Panel

-- First, let's create some sample users (regular users, not admin)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwO1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'user'),
('Jane Smith', 'jane@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwO1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'user'),
('Mike Johnson', 'mike@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwO1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'user'),
('Sarah Wilson', 'sarah@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwO1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'user'),
('David Brown', 'david@example.com', '$2a$10$7Qw1Qw1Qw1Qw1Qw1Qw1QwO1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1', 'user');

-- Create some sample bookings
INSERT INTO bookings (user_id, show_id, amount, status, payment_id, order_id) VALUES
-- Bookings for The Dark Knight (show_id = 1)
(2, 1, 250.00, 'confirmed', 'pay_1234567890', 'order_1234567890'),
(3, 1, 500.00, 'confirmed', 'pay_1234567891', 'order_1234567891'),
(4, 1, 375.00, 'confirmed', 'pay_1234567892', 'order_1234567892'),

-- Bookings for Inception (show_id = 4)
(2, 4, 300.00, 'confirmed', 'pay_1234567893', 'order_1234567893'),
(5, 4, 450.00, 'confirmed', 'pay_1234567894', 'order_1234567894'),

-- Bookings for Interstellar (show_id = 6)
(3, 6, 400.00, 'confirmed', 'pay_1234567895', 'order_1234567895'),
(4, 6, 600.00, 'confirmed', 'pay_1234567896', 'order_1234567896'),

-- Bookings for The Shawshank Redemption (show_id = 8)
(2, 8, 200.00, 'confirmed', 'pay_1234567897', 'order_1234567897'),
(5, 8, 300.00, 'confirmed', 'pay_1234567898', 'order_1234567898'),

-- Some pending bookings
(3, 2, 250.00, 'pending', NULL, 'order_1234567899'),
(4, 5, 300.00, 'pending', NULL, 'order_1234567900'),

-- Some cancelled bookings
(5, 3, 375.00, 'cancelled', 'pay_1234567901', 'order_1234567901'),
(2, 7, 400.00, 'cancelled', 'pay_1234567902', 'order_1234567902');

-- Create booking_seats entries to link bookings with specific seats
-- For The Dark Knight bookings (show_id = 1)
INSERT INTO booking_seats (booking_id, seat_id) VALUES
(1, 1), (1, 2), -- John Doe booked seats A1, A2
(2, 3), (2, 4), (2, 5), -- Jane Smith booked seats A3, A4, A5
(3, 6), (3, 7), (3, 8); -- Mike Johnson booked seats B1, B2, B3

-- For Inception bookings (show_id = 4)
INSERT INTO booking_seats (booking_id, seat_id) VALUES
(4, 16), (4, 17), -- Jane Smith booked seats for Inception
(5, 18), (5, 19), (5, 20); -- David Brown booked seats for Inception

-- For Interstellar bookings (show_id = 6)
INSERT INTO booking_seats (booking_id, seat_id) VALUES
(6, 31), (6, 32), -- Mike Johnson booked seats for Interstellar
(7, 33), (7, 34), (7, 35); -- Sarah Wilson booked seats for Interstellar

-- For The Shawshank Redemption bookings (show_id = 8)
INSERT INTO booking_seats (booking_id, seat_id) VALUES
(8, 46), (8, 47), -- Jane Smith booked seats for Shawshank
(9, 48), (9, 49), (9, 50); -- David Brown booked seats for Shawshank

-- Update seat status to 'booked' for all booked seats
UPDATE seats SET status = 'booked' WHERE id IN (
    SELECT seat_id FROM booking_seats
);

-- Add more seats for other shows to have more booking options
INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES
-- Seats for show_id = 2 (The Dark Knight 17:30)
(2, 'A1', 1, 1, 'available'), (2, 'A2', 1, 2, 'available'), (2, 'A3', 1, 3, 'available'),
(2, 'B1', 2, 1, 'available'), (2, 'B2', 2, 2, 'available'), (2, 'B3', 2, 3, 'available'),
(2, 'C1', 3, 1, 'available'), (2, 'C2', 3, 2, 'available'), (2, 'C3', 3, 3, 'available'),

-- Seats for show_id = 3 (The Dark Knight 21:00)
(3, 'A1', 1, 1, 'available'), (3, 'A2', 1, 2, 'available'), (3, 'A3', 1, 3, 'available'),
(3, 'B1', 2, 1, 'available'), (3, 'B2', 2, 2, 'available'), (3, 'B3', 2, 3, 'available'),
(3, 'C1', 3, 1, 'available'), (3, 'C2', 3, 2, 'available'), (3, 'C3', 3, 3, 'available'),

-- Seats for show_id = 4 (Inception 15:00)
(4, 'A1', 1, 1, 'booked'), (4, 'A2', 1, 2, 'booked'), (4, 'A3', 1, 3, 'available'),
(4, 'B1', 2, 1, 'booked'), (4, 'B2', 2, 2, 'booked'), (4, 'B3', 2, 3, 'booked'),
(4, 'C1', 3, 1, 'available'), (4, 'C2', 3, 2, 'available'), (4, 'C3', 3, 3, 'available'),

-- Seats for show_id = 5 (Inception 18:30)
(5, 'A1', 1, 1, 'available'), (5, 'A2', 1, 2, 'available'), (5, 'A3', 1, 3, 'available'),
(5, 'B1', 2, 1, 'available'), (5, 'B2', 2, 2, 'available'), (5, 'B3', 2, 3, 'available'),
(5, 'C1', 3, 1, 'available'), (5, 'C2', 3, 2, 'available'), (5, 'C3', 3, 3, 'available'),

-- Seats for show_id = 6 (Interstellar 16:00)
(6, 'A1', 1, 1, 'booked'), (6, 'A2', 1, 2, 'booked'), (6, 'A3', 1, 3, 'available'),
(6, 'B1', 2, 1, 'booked'), (6, 'B2', 2, 2, 'booked'), (6, 'B3', 2, 3, 'booked'),
(6, 'C1', 3, 1, 'available'), (6, 'C2', 3, 2, 'available'), (6, 'C3', 3, 3, 'available'),

-- Seats for show_id = 7 (Interstellar 19:30)
(7, 'A1', 1, 1, 'available'), (7, 'A2', 1, 2, 'available'), (7, 'A3', 1, 3, 'available'),
(7, 'B1', 2, 1, 'available'), (7, 'B2', 2, 2, 'available'), (7, 'B3', 2, 3, 'available'),
(7, 'C1', 3, 1, 'available'), (7, 'C2', 3, 2, 'available'), (7, 'C3', 3, 3, 'available'),

-- Seats for show_id = 8 (The Shawshank Redemption 13:00)
(8, 'A1', 1, 1, 'booked'), (8, 'A2', 1, 2, 'booked'), (8, 'A3', 1, 3, 'available'),
(8, 'B1', 2, 1, 'booked'), (8, 'B2', 2, 2, 'booked'), (8, 'B3', 2, 3, 'booked'),
(8, 'C1', 3, 1, 'available'), (8, 'C2', 3, 2, 'available'), (8, 'C3', 3, 3, 'available'),

-- Seats for show_id = 9 (The Shawshank Redemption 16:30)
(9, 'A1', 1, 1, 'available'), (9, 'A2', 1, 2, 'available'), (9, 'A3', 1, 3, 'available'),
(9, 'B1', 2, 1, 'available'), (9, 'B2', 2, 2, 'available'), (9, 'B3', 2, 3, 'available'),
(9, 'C1', 3, 1, 'available'), (9, 'C2', 3, 2, 'available'), (9, 'C3', 3, 3, 'available'); 