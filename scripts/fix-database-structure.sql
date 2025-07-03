-- Fix database structure for auto-join issues
-- Run this if auto-join is failing

-- 1. Check if retros table has string ID
ALTER TABLE retros ALTER COLUMN id TYPE VARCHAR(255);

-- 2. Check if participants table has string retro_id
ALTER TABLE participants ALTER COLUMN retro_id TYPE VARCHAR(255);

-- 3. Add role column if it doesn't exist
ALTER TABLE participants ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'participant';

-- 4. Add user_id column if it doesn't exist
ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- 5. Update existing participants to have role
UPDATE participants SET role = 'participant' WHERE role IS NULL OR role = '';

-- 6. Drop and recreate foreign key constraint if needed
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_retro_id_fkey;
ALTER TABLE participants ADD CONSTRAINT participants_retro_id_fkey 
    FOREIGN KEY (retro_id) REFERENCES retros(id) ON DELETE CASCADE;

-- 7. Add unique constraint for name per retro
ALTER TABLE participants DROP CONSTRAINT IF EXISTS unique_name_per_retro;
ALTER TABLE participants ADD CONSTRAINT unique_name_per_retro UNIQUE (retro_id, name);

-- 8. Verify the structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('retros', 'participants')
ORDER BY table_name, ordinal_position; 