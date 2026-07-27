-- Step 1: Add category column if not exists
ALTER TABLE mitra_donasi_profiles 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'donasi';

-- Step 2: Check and create user if not exists
DO $$
DECLARE
    v_user_id INT;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM users WHERE email = 'mitra@savora.com';
    
    IF v_user_id IS NULL THEN
        -- Create user
        INSERT INTO users (name, email, password, role, status, created_at, updated_at)
        VALUES (
            'Yayasan Berbagi',
            'mitra@savora.com',
            '$2a$10$YourHashedPasswordHere', -- Password: mitra123 (harus di-hash dengan bcrypt)
            'MITRA_DONASI',
            'ACTIVE',
            NOW(),
            NOW()
        )
        RETURNING id INTO v_user_id;
        
        RAISE NOTICE 'Created new user with ID: %', v_user_id;
    ELSE
        -- Update existing user to ACTIVE
        UPDATE users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = v_user_id AND status != 'ACTIVE';
        
        RAISE NOTICE 'Updated user ID: %', v_user_id;
    END IF;
    
    -- Check and create/update mitra_donasi_profile
    IF NOT EXISTS (SELECT 1 FROM mitra_donasi_profiles WHERE user_id = v_user_id) THEN
        -- Create profile
        INSERT INTO mitra_donasi_profiles (
            user_id, org_name, phone, address, description, 
            document_url, category, verification_status, verified_at, created_at, updated_at
        )
        VALUES (
            v_user_id,
            'Yayasan Berbagi',
            '081234567891',
            'Jl. Pahlawan No. 10, Jakarta Timur',
            'Yayasan sosial yang berfokus pada penyaluran makanan surplus kepada masyarakat yang membutuhkan',
            'https://drive.google.com/file/d/example-doc-mitra',
            'donasi',
            'APPROVED',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new mitra_donasi_profile for user_id: %', v_user_id;
    ELSE
        -- Update existing profile
        UPDATE mitra_donasi_profiles 
        SET 
            verification_status = 'APPROVED',
            verified_at = NOW(),
            category = 'donasi',
            updated_at = NOW()
        WHERE user_id = v_user_id;
        
        RAISE NOTICE 'Updated mitra_donasi_profile for user_id: %', v_user_id;
    END IF;
END $$;

-- Step 3: Verify the result
SELECT 
    'VERIFICATION' as step,
    u.id as user_id, 
    u.name, 
    u.email, 
    u.role, 
    u.status,
    m.id as profile_id,
    m.org_name, 
    m.category, 
    m.verification_status, 
    m.verified_at
FROM users u
LEFT JOIN mitra_donasi_profiles m ON m.user_id = u.id
WHERE u.email = 'mitra@savora.com';
