// services/productService.js
// ------------------------------------------------------------
// Handles upserting normalized scraper output into the
// `products` table, tracking price history, and computing
// discount percentages.
// ------------------------------------------------------------

const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const categoryCache = new Map();
const shopCache = new Map();

function getCategoryId(slug) {
  if (categoryCache.has(slug)) return categoryCache.get(slug);
  const { rows } = db.query('SELECT id FROM categories WHERE slug = $1', [slug]);
  if (rows.length === 0) return null;
  categoryCache.set(slug, rows[0].id);
  return rows[0].id;
}

function getShopId(slug) {
  if (shopCache.has(slug)) return shopCache.get(slug);
  const { rows } = db.query('SELECT id FROM shops WHERE slug = $1', [slug]);
  if (rows.length === 0) return null;
  shopCache.set(slug, rows[0].id);
  return rows[0].id;
}

/**
 * Upserts a single normalized product (see baseScraper.js for shape)
 * for the given shop. Records a price_history row if the price
 * changed since the last scrape.
 */
function upsertProduct(shopSlug, normalized) {
  const shopId = getShopId(shopSlug);
  const categoryId = getCategoryId(normalized.categorySlug);
  if (!shopId || !categoryId) {
    console.warn(
      `[productService] Skipping "${normalized.name}": unknown shop "${shopSlug}" or category "${normalized.categorySlug}"`
    );
    return null;
  }

  const discountPct =
    normalized.originalPrice && normalized.originalPrice > 0
      ? Math.round(((normalized.originalPrice - normalized.currentPrice) / normalized.originalPrice) * 10000) / 100
      : null;

  const existing = db.query('SELECT * FROM products WHERE shop_id = $1 AND external_id = $2', [
    shopId,
    normalized.externalId,
  ]);

  let productId;
  if (existing.rowCount > 0) {
    productId = existing.rows[0].id;
    const priceChanged = Number(existing.rows[0].current_price) !== Number(normalized.currentPrice);

    db.query(
      `UPDATE products SET
         name = $1, brand = $2, model = $3, image_url = $4, product_url = $5,
         current_price = $6, original_price = $7, discount_pct = $8,
         offer_ends_at = $9, in_stock = $10, specs = $11, last_updated_at = datetime('now')
       WHERE id = $12`,
      [
        normalized.name,
        normalized.brand,
        normalized.model,
        normalized.imageUrl,
        normalized.productUrl,
        normalized.currentPrice,
        normalized.originalPrice,
        discountPct,
        normalized.offerEndsAt,
        normalized.inStock ? 1 : 0,
        JSON.stringify(normalized.specs || {}),
        productId,
      ]
    );

    if (priceChanged) {
      db.query('INSERT INTO price_history (product_id, price) VALUES ($1, $2)', [productId, normalized.currentPrice]);
    }
  } else {
    productId = uuidv4();
    db.query(
      `INSERT INTO products (
         id, shop_id, category_id, name, brand, model, image_url, product_url,
         current_price, original_price, discount_pct, offer_ends_at, in_stock,
         specs, external_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        productId,
        shopId,
        categoryId,
        normalized.name,
        normalized.brand,
        normalized.model,
        normalized.imageUrl,
        normalized.productUrl,
        normalized.currentPrice,
        normalized.originalPrice,
        discountPct,
        normalized.offerEndsAt,
        normalized.inStock ? 1 : 0,
        JSON.stringify(normalized.specs || {}),
        normalized.externalId,
      ]
    );
    db.query('INSERT INTO price_history (product_id, price) VALUES ($1, $2)', [productId, normalized.currentPrice]);
  }

  return productId;
}

function upsertMany(shopSlug, normalizedProducts) {
  let count = 0;
  for (const p of normalizedProducts) {
    if (upsertProduct(shopSlug, p)) count++;
  }
  return count;
}

module.exports = { upsertProduct, upsertMany, getCategoryId, getShopId };
