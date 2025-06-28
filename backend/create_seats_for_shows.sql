-- Create seats for all existing shows (10x10 grid)
-- This script will create seats A1 to J10 for each show

DO $$
DECLARE
    show_record RECORD;
    row_letter CHAR(1);
    col_number INTEGER;
    seat_number VARCHAR(10);
BEGIN
    -- Loop through all shows
    FOR show_record IN SELECT id FROM shows LOOP
        -- Create 10x10 grid (A1 to J10)
        FOR row_num IN 1..10 LOOP
            row_letter := CHR(64 + row_num); -- A, B, C, ..., J
            
            FOR col_num IN 1..10 LOOP
                seat_number := row_letter || col_num::VARCHAR;
                
                -- Insert seat if it doesn't exist
                INSERT INTO seats (show_id, seat_number, row_number, col_number, status)
                VALUES (show_record.id, seat_number, row_num, col_num, 'available')
                ON CONFLICT (show_id, seat_number) DO NOTHING;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Created seats for show ID: %', show_record.id;
    END LOOP;
END $$;

-- Verify seats were created
SELECT 
    s.id as show_id,
    s.show_time,
    COUNT(seats.id) as seat_count
FROM shows s
LEFT JOIN seats ON s.id = seats.show_id
GROUP BY s.id, s.show_time
ORDER BY s.id; 