-- Check if user exists
SELECT 'USER CHECK:' as check_type, id, name, email, role, status 
FROM users 
WHERE email = 'mitra@savora.com';

-- Check if mitra_donasi_profiles exists
SELECT 'PROFILE CHECK:' as check_type, id, user_id, org_name, category, verification_status, verified_at 
FROM mitra_donasi_profiles 
WHERE user_id IN (SELECT id FROM users WHERE email = 'mitra@savora.com');

-- Check table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'mitra_donasi_profiles'
ORDER BY ordinal_position;
