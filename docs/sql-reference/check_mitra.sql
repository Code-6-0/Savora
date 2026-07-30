SELECT u.id, u.name, u.email, u.role, u.status, 
       m.org_name, m.category, m.verification_status, m.verified_at
FROM users u
LEFT JOIN mitra_donasi_profiles m ON m.user_id = u.id
WHERE u.role = 'MITRA_DONASI';
