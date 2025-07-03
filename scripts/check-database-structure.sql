-- Check database structure for retro and participants tables
-- Run this to diagnose auto-join issues

-- Check retros table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'retros' 
ORDER BY ordinal_position;

-- Check participants table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'participants' 
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'participants' OR tc.table_name = 'retros');

-- Check sample data
SELECT 'retros' as table_name, COUNT(*) as count FROM retros
UNION ALL
SELECT 'participants' as table_name, COUNT(*) as count FROM participants;

-- Check latest retro
SELECT id, title, status, created_at FROM retros ORDER BY created_at DESC LIMIT 3;

-- Check participants for latest retro
SELECT p.*, r.title as retro_title 
FROM participants p 
JOIN retros r ON p.retro_id = r.id 
ORDER BY p.joined_at DESC LIMIT 5; 