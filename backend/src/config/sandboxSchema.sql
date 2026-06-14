-- ============================================================
-- PartSniper — SQLite (sql.js) schema for sandbox / local dev
-- Mirrors schema.postgres.sql with SQLite-compatible types.
-- UUIDs stored as TEXT, JSONB as TEXT (JSON-encoded).
-- ============================================================

CREATE TABLE users (
    id              TEXT PRIMARY KEY,
    username        TEXT UNIQUE NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    email_verified  INTEGER DEFAULT 0,
    verification_token TEXT,
    verification_expires TEXT,
    reset_token     TEXT,
    reset_expires   TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE shops (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT UNIQUE NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    base_url        TEXT NOT NULL,
    logo_url        TEXT,
    is_active       INTEGER DEFAULT 1,
    last_scraped_at TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE shop_ratings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id     INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    UNIQUE(shop_id, user_id)
);
CREATE INDEX idx_shop_ratings_shop ON shop_ratings(shop_id);

CREATE TABLE categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT UNIQUE NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    icon        TEXT,
    sort_order  INTEGER DEFAULT 0
);

CREATE TABLE products (
    id              TEXT PRIMARY KEY,
    shop_id         INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    name            TEXT NOT NULL,
    brand           TEXT,
    model           TEXT,
    image_url       TEXT,
    product_url     TEXT NOT NULL,
    current_price   REAL NOT NULL,
    original_price  REAL,
    discount_pct    REAL,
    offer_ends_at   TEXT,
    in_stock        INTEGER DEFAULT 1,
    specs           TEXT DEFAULT '{}',
    external_id     TEXT,
    first_seen_at   TEXT DEFAULT (datetime('now')),
    last_updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(shop_id, external_id)
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_price ON products(current_price);
CREATE INDEX idx_products_discount ON products(discount_pct);

CREATE TABLE price_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price       REAL NOT NULL,
    recorded_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_price_history_product ON price_history(product_id, recorded_at);

CREATE TABLE benchmark_scores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    chip_model      TEXT NOT NULL,
    benchmark_name  TEXT NOT NULL,
    score           REAL NOT NULL,
    UNIQUE(chip_model, benchmark_name)
);

CREATE TABLE saved_products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
);

CREATE TABLE pc_builds (
    id          TEXT PRIMARY KEY,
    user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT 'My Build',
    budget      REAL,
    components  TEXT NOT NULL,
    total_price REAL,
    perf_score  REAL,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE scrape_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id     INTEGER REFERENCES shops(id),
    status      TEXT NOT NULL,
    items_found INTEGER DEFAULT 0,
    error_msg   TEXT,
    started_at  TEXT DEFAULT (datetime('now')),
    finished_at TEXT
);

-- SEED categories
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

-- SEED shops (10 real BD retailers)
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
