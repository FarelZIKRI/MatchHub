-- =====================================================
-- NANO-CONNECT DATABASE SCHEMA FOR SUPABASE
-- Merged from: nanodb.sql, supabase_auth_trigger.sql, fix_rls_users.sql, fix_users_policy.sql, setup_storage.sql
-- UPDATED: Added bio to users, Added favorites table
-- =====================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLES
-- =====================================================

-- TABLE: USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Password validation removed (nullable) to support Supabase Auth
    password VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT, -- Added for ProfilePage support
    avatar_url TEXT,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('sme', 'influencer', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- TABLE: INFLUENCERS
CREATE TABLE IF NOT EXISTS influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    followers_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0.00,
    niche VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook')),
    platform_username VARCHAR(100),
    price_per_post DECIMAL(12, 2) DEFAULT 0.00, -- IDR
    price_per_story DECIMAL(12, 2) DEFAULT 0.00, -- IDR
    price_per_video DECIMAL(12, 2) DEFAULT 0.00, -- IDR
    location VARCHAR(100),
    portfolio_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    total_orders INTEGER DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_influencers_user_id ON influencers(user_id);
CREATE INDEX IF NOT EXISTS idx_influencers_niche ON influencers(niche);
CREATE INDEX IF NOT EXISTS idx_influencers_platform ON influencers(platform);
CREATE INDEX IF NOT EXISTS idx_influencers_followers ON influencers(followers_count);
CREATE INDEX IF NOT EXISTS idx_influencers_price ON influencers(price_per_post);

-- TABLE: ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE RESTRICT,
    sme_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('post', 'story', 'video', 'bundle')),
    order_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
    description TEXT,
    total_price DECIMAL(12, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    deadline DATE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_influencer_id ON orders(influencer_id);
CREATE INDEX IF NOT EXISTS idx_orders_sme_id ON orders(sme_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- TABLE: REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- TABLE: FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, influencer_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- =====================================================
-- 3. TRIGGERS & FUNCTIONS (UPDATED_AT)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_influencers_updated_at ON influencers;
CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON influencers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. SUPABASE AUTH INTEGRATION
-- =====================================================

-- AUTO-CONFIRM: Otomatis konfirmasi email user baru agar bisa langsung login
-- tanpa perlu verifikasi email manual
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_confirm ON auth.users;
CREATE TRIGGER on_auth_user_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();

-- HANDLE NEW USER: Buat profil di public.users setelah register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, user_type, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (NEW.raw_user_meta_data->>'name'), -- Default Avatar
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'sme'), -- Default 'sme'
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- 5. STORAGE SETUP
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update avatars" ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects FOR DELETE USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users Policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Public can view user profiles" ON users;
CREATE POLICY "Public can view user profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Influencers Policies
DROP POLICY IF EXISTS "Influencers are viewable by everyone" ON influencers;
CREATE POLICY "Influencers are viewable by everyone" ON influencers FOR SELECT USING (true);

-- Orders Policies
DROP POLICY IF EXISTS "Orders viewable by involved parties" ON orders;
CREATE POLICY "Orders viewable by involved parties" ON orders FOR SELECT USING (
    auth.uid()::text = sme_id::text 
    OR auth.uid()::text IN (
        SELECT user_id::text FROM influencers WHERE id = orders.influencer_id
    )
);

DROP POLICY IF EXISTS "SME can create orders" ON orders;
CREATE POLICY "SME can create orders" ON orders FOR INSERT WITH CHECK (
    auth.uid()::text = sme_id::text
);

DROP POLICY IF EXISTS "Involved parties can update orders" ON orders;
CREATE POLICY "Involved parties can update orders" ON orders FOR UPDATE USING (
    auth.uid()::text = sme_id::text 
    OR auth.uid()::text IN (
        SELECT user_id::text FROM influencers WHERE id = orders.influencer_id
    )
);

-- Reviews Policies
DROP POLICY IF EXISTS "Visible reviews are public" ON reviews;
CREATE POLICY "Visible reviews are public" ON reviews FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (
    auth.uid()::text = reviewer_id::text
);

-- Favorites Policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove favorites" ON favorites;
CREATE POLICY "Users can remove favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. SAMPLE DATA
-- =====================================================

-- USERS
INSERT INTO users (id, name, email, password, phone, bio, avatar_url, user_type, is_verified, is_active) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Admin Nano', 'admin@nanoconnect.id', '$2b$10$hashedpassword1', '081234567890', 'Admin Account', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin', TRUE, TRUE),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Rina Kusuma', 'rina.k@gmail.com', '$2b$10$hashedpassword2', '081234567891', 'Beauty enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rina', 'influencer', TRUE, TRUE),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Budi Santoso', 'budi.s@gmail.com', '$2b$10$hashedpassword3', '081234567892', 'Tech Reviewer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi', 'influencer', TRUE, TRUE),
('d4e5f6a7-b8c9-0123-defa-234567890123', 'Maya Putri', 'maya.p@gmail.com', '$2b$10$hashedpassword4', '081234567893', 'Food Blogger', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya', 'influencer', TRUE, TRUE),
('e5f6a7b8-c9d0-1234-efab-345678901234', 'Toko Berkah Jaya', 'berkah.jaya@gmail.com', '$2b$10$hashedpassword5', '081234567894', 'UMKM Retail', 'https://api.dicebear.com/7.x/avataaars/svg?seed=berkah', 'sme', TRUE, TRUE),
('f6a7b8c9-d0e1-2345-fabc-456789012345', 'CV Maju Bersama', 'maju.bersama@gmail.com', '$2b$10$hashedpassword6', '081234567895', 'Distributor Elektronik', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maju', 'sme', TRUE, TRUE),
('a7b8c9d0-e1f2-3456-abcd-567890123456', 'Warung Mak Ijah', 'mak.ijah@gmail.com', '$2b$10$hashedpassword7', '081234567896', 'Kuliner Tradisional', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ijah', 'sme', TRUE, TRUE),
('b8c9d0e1-f2a3-4567-bcde-678901234567', 'Doni Wijaya', 'doni.w@gmail.com', '$2b$10$hashedpassword8', '081234567897', 'Travel Vlogger', 'https://api.dicebear.com/7.x/avataaars/svg?seed=doni', 'influencer', TRUE, TRUE),
('c9d0e1f2-a3b4-5678-cdef-789012345678', 'Sarah Beauty', 'sarah.beauty@gmail.com', '$2b$10$hashedpassword9', '081234567898', 'Skincare Guru', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'influencer', TRUE, TRUE),
('d0e1f2a3-b4c5-6789-defa-890123456789', 'Bakso Pak Kumis', 'bakso.kumis@gmail.com', '$2b$10$hashedpassword10', '081234567899', 'Kuliner Bakso', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kumis', 'sme', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- INFLUENCERS
INSERT INTO influencers (id, user_id, bio, followers_count, engagement_rate, niche, platform, platform_username, price_per_post, price_per_story, price_per_video, location, is_available, total_orders, avg_rating) VALUES
('11111111-1111-1111-1111-111111111111', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Beauty & lifestyle content creator. Sharing tips kecantikan dan gaya hidup sehari-hari ✨', 125000, 4.50, 'beauty', 'instagram', '@rinakusuma', 1500000.00, 500000.00, 3000000.00, 'Jakarta', TRUE, 45, 4.80),
('22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Beauty tips dan tutorial makeup 💄', 85000, 5.20, 'beauty', 'tiktok', '@rinakusuma_', 1000000.00, 300000.00, 2000000.00, 'Jakarta', TRUE, 32, 4.70),
('33333333-3333-3333-3333-333333333333', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Tech reviewer & gadget enthusiast 📱 Review jujur tanpa sponsor!', 250000, 3.80, 'technology', 'youtube', 'BudiTechID', 5000000.00, 0.00, 8000000.00, 'Bandung', TRUE, 28, 4.90),
('44444444-4444-4444-4444-444444444444', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Food blogger | Kuliner Nusantara 🍜 Yang enak-enak aja~', 180000, 6.20, 'food', 'instagram', '@mayakuliner', 2000000.00, 750000.00, 4000000.00, 'Surabaya', TRUE, 67, 4.85),
('55555555-5555-5555-5555-555555555555', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Jelajah kuliner Indonesia 🇮🇩', 320000, 7.10, 'food', 'tiktok', '@mayamakan', 2500000.00, 800000.00, 5000000.00, 'Surabaya', TRUE, 89, 4.92),
('66666666-6666-6666-6666-666666666666', 'b8c9d0e1-f2a3-4567-bcde-678901234567', 'Travel vlogger | Petualang budget 🌏 Tips traveling hemat!', 95000, 4.00, 'travel', 'instagram', '@doniexplore', 1200000.00, 400000.00, 2500000.00, 'Yogyakarta', TRUE, 23, 4.60),
('77777777-7777-7777-7777-777777777777', 'b8c9d0e1-f2a3-4567-bcde-678901234567', 'Hidden gems Indonesia 🗺️', 150000, 5.50, 'travel', 'youtube', 'DoniExploreID', 3500000.00, 0.00, 6000000.00, 'Yogyakarta', TRUE, 18, 4.75),
('88888888-8888-8888-8888-888888888888', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'Skincare addict 🧴 Review produk lokal & drugstore!', 210000, 5.80, 'beauty', 'instagram', '@sarahbeautyid', 2200000.00, 700000.00, 4500000.00, 'Jakarta', TRUE, 56, 4.88),
('99999999-9999-9999-9999-999999999999', 'c9d0e1f2-a3b4-5678-cdef-789012345678', 'Skincare routine & tips ✨', 280000, 6.50, 'beauty', 'tiktok', '@sarahglow', 2800000.00, 900000.00, 5500000.00, 'Jakarta', FALSE, 71, 4.95),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Tips & trik teknologi sehari-hari', 45000, 4.20, 'technology', 'tiktok', '@buditech', 800000.00, 250000.00, 1500000.00, 'Bandung', TRUE, 12, 4.50)
ON CONFLICT (id) DO NOTHING;

-- ORDERS
INSERT INTO orders (id, influencer_id, sme_id, order_type, order_status, description, total_price, payment_status, deadline, completed_at, notes) VALUES
('01d11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'post', 'completed', 'Promosi produk skincare baru, highlight kandungan alami dan manfaat untuk kulit berminyak', 1500000.00, 'paid', '2026-01-15', '2026-01-14 10:30:00+07', 'Hasil memuaskan, engagement tinggi'),
('02d22222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'a7b8c9d0-e1f2-3456-abcd-567890123456', 'story', 'completed', 'Review makanan di warung, fokus ke menu baru sate dan soto', 750000.00, 'paid', '2026-01-20', '2026-01-19 15:45:00+07', 'Banyak customer baru datang setelah posting'),
('03d33333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'video', 'in_progress', 'Unboxing dan review produk elektronik terbaru, durasi 10-15 menit', 8000000.00, 'paid', '2026-02-10', NULL, 'Sedang proses editing'),
('04d44444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'd0e1f2a3-b4c5-6789-defa-890123456789', 'bundle', 'pending', 'Paket promosi: 2 video TikTok + 3 story untuk menu baru bakso', 15000000.00, 'unpaid', '2026-02-15', NULL, 'Menunggu konfirmasi pembayaran'),
('05d55555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'post', 'accepted', 'Promosi serum vitamin C, before-after 2 minggu pemakaian', 2200000.00, 'paid', '2026-02-08', NULL, 'Brief sudah disetujui'),
('06d66666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'story', 'completed', 'Highlight promosi flash sale akhir tahun', 400000.00, 'paid', '2025-12-31', '2025-12-30 20:00:00+07', NULL),
('07d77777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'a7b8c9d0-e1f2-3456-abcd-567890123456', 'video', 'cancelled', 'Tutorial makeup natural untuk sehari-hari', 2000000.00, 'refunded', '2026-01-25', NULL, 'Dibatalkan karena jadwal bentrok'),
('08d88888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 'video', 'completed', 'Vlog kunjungan ke pabrik dan review proses produksi', 6000000.00, 'paid', '2026-01-28', '2026-01-27 14:20:00+07', 'Video sudah upload, performance bagus'),
('09d99999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'post', 'rejected', 'Promosi aplikasi mobile baru', 800000.00, 'unpaid', '2026-02-01', NULL, 'Niche tidak sesuai dengan produk'),
('0adaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '99999999-9999-9999-9999-999999999999', 'd0e1f2a3-b4c5-6789-defa-890123456789', 'bundle', 'pending', 'Paket lengkap promosi menu baru', 12000000.00, 'unpaid', '2026-02-20', NULL, 'Menunggu influencer available')
ON CONFLICT (id) DO NOTHING;

-- REVIEWS
INSERT INTO reviews (id, order_id, reviewer_id, rating, comment, is_visible) VALUES
('1e011111-1111-1111-1111-111111111111', '01d11111-1111-1111-1111-111111111111', 'e5f6a7b8-c9d0-1234-efab-345678901234', 5, 'Kak Rina sangat profesional! Hasil postingannya bagus banget, engagement naik 30% setelah posting. Pasti order lagi!', TRUE),
('2e022222-2222-2222-2222-222222222222', '02d22222-2222-2222-2222-222222222222', 'a7b8c9d0-e1f2-3456-abcd-567890123456', 5, 'Maya reviewnya jujur dan menarik. Banyak customer baru yang datang sambil bilang lihat dari TikTok. Recommended!', TRUE),
('3e033333-3333-3333-3333-333333333333', '06d66666-6666-6666-6666-666666666666', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 4, 'Cepat dan tepat waktu. Hasilnya bagus, cuma agak kurang detail di caption. Overall puas.', TRUE),
('4e044444-4444-4444-4444-444444444444', '08d88888-8888-8888-8888-888888888888', 'f6a7b8c9-d0e1-2345-fabc-456789012345', 5, 'Video kunjungan pabriknya keren banget! Editing profesional, narasi jelas. Worth every penny!', TRUE)
ON CONFLICT (id) DO NOTHING;
