-- Add real-time seat locking columns to seats table
ALTER TABLE seats
ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS locked_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'available'; 