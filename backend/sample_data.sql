-- Sample Movies Data
INSERT INTO movies (title, description, poster_url, duration) VALUES
('The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 152),
('Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 148),
('Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 169),
('The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 142),
('Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 154),
('The Matrix', 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 136),
('Forrest Gump', 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.', 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', 142),
('The Lord of the Rings: The Fellowship of the Ring', 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.', 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', 178);

-- Sample Shows Data (for the first movie)
INSERT INTO shows (movie_id, show_time, screen) VALUES
(1, '2024-01-15 14:00:00', 'Screen 1'),
(1, '2024-01-15 17:30:00', 'Screen 1'),
(1, '2024-01-15 21:00:00', 'Screen 1'),
(2, '2024-01-15 15:00:00', 'Screen 2'),
(2, '2024-01-15 18:30:00', 'Screen 2'),
(3, '2024-01-15 16:00:00', 'Screen 3'),
(3, '2024-01-15 19:30:00', 'Screen 3'),
(4, '2024-01-15 13:00:00', 'Screen 4'),
(4, '2024-01-15 16:30:00', 'Screen 4');

-- Sample Seats Data (for the first show)
INSERT INTO seats (show_id, seat_number, row_number, col_number, status) VALUES
(1, 'A1', 1, 1, 'available'),
(1, 'A2', 1, 2, 'available'),
(1, 'A3', 1, 3, 'available'),
(1, 'A4', 1, 4, 'available'),
(1, 'A5', 1, 5, 'available'),
(1, 'B1', 2, 1, 'available'),
(1, 'B2', 2, 2, 'available'),
(1, 'B3', 2, 3, 'available'),
(1, 'B4', 2, 4, 'available'),
(1, 'B5', 2, 5, 'available'),
(1, 'C1', 3, 1, 'available'),
(1, 'C2', 3, 2, 'available'),
(1, 'C3', 3, 3, 'available'),
(1, 'C4', 3, 4, 'available'),
(1, 'C5', 3, 5, 'available'); 