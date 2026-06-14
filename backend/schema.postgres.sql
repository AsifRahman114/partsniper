-- ============================================================
-- PartSniper — PostgreSQL Production Schema
-- This is the canonical schema for production deployment.
-- The sandbox dev environment uses an sql.js (SQLite-syntax)
-- equivalent in src/config/sandboxSchema.sql with identical
-- table/column names so application code is portable as-is.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------
-- USERS
-- ----------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(30) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    email_verified  BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expires TIMESTAMP,
    reset_token     VARCHAR(255),
    reset_expires   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ----------------------------
-- SHOPS (the 10 BD retailers)
-- ----------------------------
CREATE TABLE shops (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    base_url        VARCHAR(255) NOT NULL,
    logo_url        VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    last_scraped_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ----------------------------
-- SHOP RATINGS (user-submitted, drives shop reputation score)
-- ----------------------------
CREATE TABLE shop_ratings (
    id          SERIAL PRIMARY KEY,
    shop_id     INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, user_id)  -- one rating per user per shop, can be updated
);

CREATE INDEX idx_shop_ratings_shop ON shop_ratings(shop_id);

-- ----------------------------
-- CATEGORIES
-- ----------------------------
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,    -- 'GPU','CPU','RAM','Motherboard', etc.
    slug        VARCHAR(50) UNIQUE NOT NULL,
    icon        VARCHAR(50),
    sort_order  INTEGER DEFAULT 0
);

-- ----------------------------
-- PRODUCTS (scraped/aggregated catalog)
-- ----------------------------
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    name            VARCHAR(500) NOT NULL,
    brand           VARCHAR(100),
    model           VARCHAR(150),
    image_url       VARCHAR(500),
    product_url     VARCHAR(500) NOT NULL,      -- link to shop's product page (the "Buy" target)
    current_price   NUMERIC(12,2) NOT NULL,     -- price now (BDT)
    original_price  NUMERIC(12,2),              -- pre-discount price, NULL if no discount
    discount_pct    NUMERIC(5,2),               -- computed: (original-current)/original*100
    offer_ends_at   TIMESTAMP,                  -- offer last date, NULL if no offer / unknown
    in_stock        BOOLEAN DEFAULT TRUE,
    specs           JSONB DEFAULT '{}',         -- structured specs e.g. {"vram":"12GB","socket":"AM5","wattage":650}
    external_id     VARCHAR(255),               -- shop's internal SKU/id for de-dup on re-scrape
    first_seen_at   TIMESTAMP DEFAULT NOW(),
    last_updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(shop_id, external_id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_price ON products(current_price);
CREATE INDEX idx_products_discount ON products(discount_pct DESC NULLS LAST);
-- full text search across name/brand/model
CREATE INDEX idx_products_search ON products USING GIN (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(model,''))
);

-- ----------------------------
-- PRICE HISTORY (for trend charts / "lowest ever" badges)
-- ----------------------------
CREATE TABLE price_history (
    id          BIGSERIAL PRIMARY KEY,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price       NUMERIC(12,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history(product_id, recorded_at DESC);

-- ----------------------------
-- BENCHMARK SCORES (for CPU/GPU "performance" used in comparisons & PC builder)
-- ----------------------------
CREATE TABLE benchmark_scores (
    id              SERIAL PRIMARY KEY,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    chip_model      VARCHAR(150) NOT NULL,   -- normalized name e.g. "RTX 4060", "Ryzen 5 7600"
    benchmark_name  VARCHAR(50) NOT NULL,    -- 'passmark','3dmark','geekbench6', etc.
    score           NUMERIC(12,2) NOT NULL,
    UNIQUE(chip_model, benchmark_name)
);

-- ----------------------------
-- USER SAVED ITEMS (wishlist / price-watch)
-- ----------------------------
CREATE TABLE saved_products (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ----------------------------
-- PC BUILDS (saved builder configurations)
-- ----------------------------
CREATE TABLE pc_builds (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE, -- nullable: allow guest builds
    name        VARCHAR(150) NOT NULL DEFAULT 'My Build',
    budget      NUMERIC(12,2),
    components  JSONB NOT NULL,   -- { "CPU": product_id, "GPU": product_id, ... }
    total_price NUMERIC(12,2),
    perf_score  NUMERIC(12,2),    -- aggregate performance score
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ----------------------------
-- SCRAPE LOGS (observability)
-- ----------------------------
CREATE TABLE scrape_logs (
    id          SERIAL PRIMARY KEY,
    shop_id     INTEGER REFERENCES shops(id),
    status      VARCHAR(20) NOT NULL,  -- 'success','partial','failed'
    items_found INTEGER DEFAULT 0,
    error_msg   TEXT,
    started_at  TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP
);

-- ============================================================
-- SEED: Categories
-- ============================================================
INSERT INTO categories (name, slug, icon, sort_order) VALUES
('GPU', 'gpu', 'cpu', 1),
('CPU', 'cpu', 'chip', 2),
('Motherboard', 'motherboard', 'circuit-board', 3),
('RAM', 'ram', 'memory-stick', 4),
('SSD', 'ssd', 'hard-drive', 5),
('HDD', 'hdd', 'database', 6),
('Power Supply', 'psu', 'plug', 7),
('Casing', 'casing', 'box', 8),
('Monitor', 'monitor', 'monitor', 9),
('Laptop', 'laptop', 'laptop', 10),
('Keyboard', 'keyboard', 'keyboard', 11),
('Mouse', 'mouse', 'mouse', 12),
('Headphone', 'headphone', 'headphones', 13),
('Cooler', 'cooler', 'fan', 14);

-- ============================================================
-- SEED: Shops (10 real BD retailers)
-- ============================================================
INSERT INTO shops (name, slug, base_url, logo_url) VALUES
('Star Tech', 'startech', 'https://www.startech.com.bd', '/logos/startech.png'),
('Techland BD', 'techland', 'https://www.techlandbd.com', '/logos/techland.png'),
('Ryans Computers', 'ryans', 'https://www.ryans.com', '/logos/ryans.png'),
('ComputerMania BD', 'computermania', 'https://www.computermania.com.bd', '/logos/computermania.png'),
('UCC BD', 'ucc', 'https://www.ucc.com.bd', '/logos/ucc.png'),
('Potaka IT', 'potaka', 'https://www.potakait.com', '/logos/potaka.png'),
('PC House', 'pchouse', 'https://www.pchouse.com.bd', '/logos/pchouse.png'),
('EZ Gadgets', 'ezgadgets', 'https://www.ezgadgets.com.bd', '/logos/ezgadgets.png'),
('Bengal PC', 'bengalpc', 'https://www.bengalpc.com', '/logos/bengalpc.png'),
('Tech Monster BD', 'techmonster', 'https://www.techmonsterbd.com', '/logos/techmonster.png');
