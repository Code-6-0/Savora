-- Create donation_offers table if not exists
CREATE TABLE IF NOT EXISTS donation_offers (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES users(id),
    donor_type VARCHAR(50) NOT NULL,
    mitra_id INTEGER REFERENCES mitra_donasi_profiles(id),
    category VARCHAR(100) NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    food_type VARCHAR(100),
    quantity INTEGER NOT NULL,
    weight DOUBLE PRECISION,
    description TEXT,
    pickup_address TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    available_from TIMESTAMP NOT NULL,
    available_until TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    rejection_reason TEXT,
    photo_url VARCHAR(500),
    notes TEXT,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create donation_history table if not exists
CREATE TABLE IF NOT EXISTS donation_history (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL UNIQUE REFERENCES donation_offers(id),
    mitra_id INTEGER NOT NULL REFERENCES mitra_donasi_profiles(id),
    donor_id INTEGER NOT NULL REFERENCES users(id),
    portions_saved INTEGER NOT NULL,
    weight_kg DOUBLE PRECISION,
    proof_photo_url VARCHAR(500),
    pickup_notes TEXT,
    pickup_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donation_offers_status ON donation_offers(status);
CREATE INDEX IF NOT EXISTS idx_donation_offers_mitra_id ON donation_offers(mitra_id);
CREATE INDEX IF NOT EXISTS idx_donation_offers_category ON donation_offers(category);
CREATE INDEX IF NOT EXISTS idx_donation_history_mitra_id ON donation_history(mitra_id);

-- Verify tables created
SELECT 
    'TABLES CREATED' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'donation_offers') as donation_offers_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'donation_history') as donation_history_exists;
