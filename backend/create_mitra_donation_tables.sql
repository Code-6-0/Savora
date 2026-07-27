-- SQL untuk membuat tabel donation_offers dan donation_histories
-- Jalankan script ini jika AUTO_MIGRATE belum dijalankan atau tabel belum ada

-- Tabel donation_offers
CREATE TABLE IF NOT EXISTS donation_offers (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mitra_id INTEGER REFERENCES mitra_donasi_profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    food_type VARCHAR(100),
    category VARCHAR(50),
    quantity INTEGER DEFAULT 1,
    weight_kg DECIMAL(10, 2) DEFAULT 0,
    available_from TIMESTAMP NOT NULL,
    available_until TIMESTAMP NOT NULL,
    pickup_address TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    rejection_reason TEXT,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_donation_offers_donor_id ON donation_offers(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_offers_mitra_id ON donation_offers(mitra_id);
CREATE INDEX IF NOT EXISTS idx_donation_offers_status ON donation_offers(status);
CREATE INDEX IF NOT EXISTS idx_donation_offers_available_until ON donation_offers(available_until);

-- Tabel donation_histories
CREATE TABLE IF NOT EXISTS donation_histories (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES donation_offers(id) ON DELETE CASCADE,
    mitra_id INTEGER NOT NULL REFERENCES mitra_donasi_profiles(id) ON DELETE CASCADE,
    donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portions_saved INTEGER DEFAULT 0,
    weight_kg DECIMAL(10, 2) DEFAULT 0,
    pickup_date TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_donation_histories_offer_id ON donation_histories(offer_id);
CREATE INDEX IF NOT EXISTS idx_donation_histories_mitra_id ON donation_histories(mitra_id);
CREATE INDEX IF NOT EXISTS idx_donation_histories_donor_id ON donation_histories(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_histories_pickup_date ON donation_histories(pickup_date);

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke donation_offers
DROP TRIGGER IF EXISTS update_donation_offers_updated_at ON donation_offers;
CREATE TRIGGER update_donation_offers_updated_at
    BEFORE UPDATE ON donation_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger ke donation_histories
DROP TRIGGER IF EXISTS update_donation_histories_updated_at ON donation_histories;
CREATE TRIGGER update_donation_histories_updated_at
    BEFORE UPDATE ON donation_histories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Cek apakah tabel sudah dibuat
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('donation_offers', 'donation_histories')
ORDER BY table_name;
