@echo off
echo Fixing seats table schema...
echo.
echo Please enter the password when prompted: 8d9a6594e6fc4135ae527daf7b2b9196
echo.
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d movie_booking_db -c "
-- Update seat_status enum to include 'locked' status
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'locked' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'seat_status')
    ) THEN
        ALTER TYPE seat_status ADD VALUE 'locked';
        RAISE NOTICE 'Added \"locked\" to seat_status enum';
    ELSE
        RAISE NOTICE '\"locked\" already exists in seat_status enum';
    END IF;
END \$\$;

-- Add missing columns to seats table
ALTER TABLE seats
ADD COLUMN IF NOT EXISTS locked_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seats_locked_by ON seats(locked_by);
CREATE INDEX IF NOT EXISTS idx_seats_lock_expires ON seats(lock_expires_at);

-- Clean up any existing expired locks
UPDATE seats 
SET status = 'available', 
    locked_by = NULL, 
    locked_at = NULL, 
    lock_expires_at = NULL 
WHERE status = 'locked' AND lock_expires_at < NOW();
"
echo.
echo Seats table schema fixed!
pause 