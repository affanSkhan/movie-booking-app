-- Update seat_status enum to include 'locked' status
-- First, let's check the current enum values
SELECT unnest(enum_range(NULL::seat_status)) as current_values;

-- Add 'locked' to the enum if it doesn't exist
DO $$
BEGIN
    -- Check if 'locked' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'locked' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'seat_status')
    ) THEN
        -- Add 'locked' to the enum
        ALTER TYPE seat_status ADD VALUE 'locked';
        RAISE NOTICE 'Added "locked" to seat_status enum';
    ELSE
        RAISE NOTICE '"locked" already exists in seat_status enum';
    END IF;
END $$;

-- Verify the updated enum values
SELECT unnest(enum_range(NULL::seat_status)) as updated_values; 