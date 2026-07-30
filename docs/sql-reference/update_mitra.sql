-- Update user mitra menjadi ACTIVE
UPDATE users 
SET status = 'ACTIVE' 
WHERE role = 'MITRA_DONASI' AND email = 'mitra@savora.com';

-- Update mitra_donasi_profiles menjadi APPROVED dan tambah category
UPDATE mitra_donasi_profiles 
SET 
    verification_status = 'APPROVED',
    verified_at = NOW(),
    category = COALESCE(category, 'donasi')
WHERE user_id IN (
    SELECT id FROM users WHERE role = 'MITRA_DONASI' AND email = 'mitra@savora.com'
);

-- Verify the update
SELECT u.id, u.name, u.email, u.role, u.status, 
       m.org_name, m.category, m.verification_status, m.verified_at
FROM users u
LEFT JOIN mitra_donasi_profiles m ON m.user_id = u.id
WHERE u.role = 'MITRA_DONASI' AND u.email = 'mitra@savora.com';
