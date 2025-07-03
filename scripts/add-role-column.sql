-- Add role column to participants table for facilitator transfer feature
-- Run this if the role column doesn't exist

-- Check if role column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'participants' AND column_name = 'role'
) as has_role_column;

-- Add role column if it doesn't exist
ALTER TABLE participants ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'participant';

-- Update existing participants to have role
UPDATE participants SET role = 'participant' WHERE role IS NULL OR role = '';

-- Set the first participant as facilitator (if no facilitator exists)
UPDATE participants 
SET role = 'facilitator' 
WHERE id = (
  SELECT id FROM participants 
  WHERE retro_id = (
    SELECT id FROM retros ORDER BY created_at DESC LIMIT 1
  ) 
  ORDER BY joined_at ASC 
  LIMIT 1
) 
AND NOT EXISTS (
  SELECT 1 FROM participants 
  WHERE role = 'facilitator' 
  AND retro_id = (
    SELECT id FROM retros ORDER BY created_at DESC LIMIT 1
  )
);

-- Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'participants' AND column_name = 'role';

-- Show current facilitators
SELECT 
  p.name as facilitator_name,
  r.title as retro_title,
  p.joined_at
FROM participants p
JOIN retros r ON p.retro_id = r.id
WHERE p.role = 'facilitator'
ORDER BY p.joined_at DESC; 