-- =====================================================
-- DIAGNOSTIC QUERIES for UMKM Dashboard Access Issue
-- Run these in your Supabase SQL Editor or psql
-- =====================================================

-- 1. Find the UMKM user "Bu Lestari" and check their status
SELECT
    u.id,
    u.name,
    u.email,
    u.role,
    u.status as user_status,
    up.id as profile_id,
    up.business_name,
    up.verification_status,
    up.created_at as profile_created
FROM users u
LEFT JOIN umkm_profiles up ON u.id = up.user_id
WHERE u.role = 'UMKM'
  AND (u.name ILIKE '%lestari%' OR u.email ILIKE '%lestari%')
ORDER BY u.created_at DESC;

-- Expected results:
-- ✓ GOOD: verification_status = 'APPROVED' → Should work
-- ✗ BAD: verification_status = 'PENDING' → Blocks dashboard access
-- ✗ BAD: verification_status = 'REJECTED' → Blocks dashboard access
-- ✗ BAD: profile_id IS NULL → No umkm_profile record exists!

-- 2. If profile exists, check all UMKM profiles to compare
SELECT
    u.name,
    u.email,
    up.business_name,
    up.verification_status,
    up.created_at
FROM umkm_profiles up
JOIN users u ON up.user_id = u.id
ORDER BY up.created_at DESC
LIMIT 10;

-- 3. Check if there are ANY approved UMKM users (to verify the system works)
SELECT COUNT(*) as total_umkm,
       COUNT(CASE WHEN verification_status = 'APPROVED' THEN 1 END) as approved,
       COUNT(CASE WHEN verification_status = 'PENDING' THEN 1 END) as pending,
       COUNT(CASE WHEN verification_status = 'REJECTED' THEN 1 END) as rejected,
       COUNT(CASE WHEN verification_status IS NULL THEN 1 END) as null_status
FROM umkm_profiles;
