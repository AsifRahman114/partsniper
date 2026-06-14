// routes/products.js
const express = require('express');
const db = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

function serializeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    model: row.model,
    imageUrl: row.image_url,
    productUrl: row.product_url,
    currentPrice: row.current_price,
    originalPrice: row.original_price,
    discountPct: row.discount_pct,
    offerEndsAt: row.offer_ends_at,
    inStock: !!row.in_stock,
    specs: (() => { try { return JSON.parse(row.specs || '{}'); } catch { return {}; } })(),
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
    shop: {
      id: row.shop_id,
      name: row.shop_name,
      slug: row.shop_slug,
      avgRating: row.shop_avg_rating != null ? Number(row.shop_avg_rating) : null,
      ratingCount: row.shop_rating_count || 0,
    },
    lastUpdatedAt: row.last_updated_at,
    isSaved: !!row.is_saved,
  };
}

const BASE_SELECT = `
  SELECT
    p.*,
    c.name as category_name, c.slug as category_slug,
    s.name as shop_name, s.slug as shop_slug,
    sr.avg_rating as shop_avg_rating, sr.rating_count as shop_rating_count
    {SAVED_COL}
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN shops s ON s.id = p.shop_id
  LEFT JOIN (
    SELECT shop_id, ROUND(AVG(rating),2) as avg_rating, COUNT(*) as rating_count
    FROM shop_ratings GROUP BY shop_id
  ) sr ON sr.shop_id = s.id
  {SAVED_JOIN}
`;

/**
 * Builds the WHERE clause + params for product listing based on query params.
 * Supported query params:
 *   category   - category slug (e.g. "gpu")
 *   search     - free-text search across name/brand/model
 *   minPrice   - minimum current_price
 *   maxPrice   - maximum current_price
 *   discountsOnly - "true" => only products with discount_pct IS NOT NULL
 *   inStockOnly   - "true" => only in_stock = 1
 *   shop       - shop slug filter
 *   sort       - 'price_asc' | 'price_desc' | 'discount_desc' | 'newest' | 'rating_desc'
 */
function buildQuery(query, userId) {
  const where = [];
  const params = [];

  if (query.category) {
    where.push('c.slug = $' + (params.length + 1));
    params.push(query.category);
  }

  if (query.shop) {
    where.push('s.slug = $' + (params.length + 1));
    params.push(query.shop);
  }

  if (query.search) {
    const term = `%${query.search.trim()}%`;
    where.push(`(p.name LIKE $${params.length + 1} OR p.brand LIKE $${params.length + 2} OR p.model LIKE $${params.length + 3})`);
    params.push(term, term, term);
  }

  if (query.minPrice) {
    where.push('p.current_price >= $' + (params.length + 1));
    params.push(Number(query.minPrice));
  }
  if (query.maxPrice) {
    where.push('p.current_price <= $' + (params.length + 1));
    params.push(Number(query.maxPrice));
  }

  if (query.discountsOnly === 'true') {
    where.push('p.discount_pct IS NOT NULL');
  }

  if (query.inStockOnly === 'true') {
    where.push('p.in_stock = 1');
  }

  let orderBy = 'p.last_updated_at DESC';
  switch (query.sort) {
    case 'price_asc': orderBy = 'p.current_price ASC'; break;
    case 'price_desc': orderBy = 'p.current_price DESC'; break;
    case 'discount_desc': orderBy = 'p.discount_pct IS NULL, p.discount_pct DESC'; break;
    case 'rating_desc': orderBy = 'sr.avg_rating IS NULL, sr.avg_rating DESC, p.current_price ASC'; break;
    case 'newest': orderBy = 'p.first_seen_at DESC'; break;
    default: orderBy = 'p.last_updated_at DESC';
  }

  let savedCol = '';
  let savedJoin = '';
  if (userId) {
    savedCol = `, CASE WHEN sp.id IS NOT NULL THEN 1 ELSE 0 END as is_saved`;
    savedJoin = `LEFT JOIN saved_products sp ON sp.product_id = p.id AND sp.user_id = $${params.length + 1}`;
    params.push(userId);
  } else {
    savedCol = `, 0 as is_saved`;
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  return { whereClause, orderBy, params, savedCol, savedJoin };
}

// ----------------------------------------------------------------
// GET /api/products
// ----------------------------------------------------------------
router.get('/', optionalAuth, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(60, Math.max(1, parseInt(req.query.limit) || 24));
  const offset = (page - 1) * limit;

  const { whereClause, orderBy, params, savedCol, savedJoin } = buildQuery(req.query, req.user?.id);

  const select = BASE_SELECT.replace('{SAVED_COL}', savedCol).replace('{SAVED_JOIN}', savedJoin);

  const countSql = `
    SELECT COUNT(*) as cnt FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN shops s ON s.id = p.shop_id
    ${whereClause}
  `;
  // Count query doesn't need the saved-join params
  const countParams = params.slice(0, params.length - (req.user ? 1 : 0));
  const { rows: countRows } = db.query(countSql, countParams);
  const total = countRows[0].cnt;

  const sql = `${select} ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const { rows } = db.query(sql, [...params, limit, offset]);

  res.json({
    products: rows.map(serializeProduct),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ----------------------------------------------------------------
// GET /api/products/:id  - single product detail, plus the SAME
// product from other shops (for quick price comparison on detail page)
// ----------------------------------------------------------------
router.get('/:id', optionalAuth, (req, res) => {
  const savedCol = req.user ? `, CASE WHEN sp.id IS NOT NULL THEN 1 ELSE 0 END as is_saved` : ', 0 as is_saved';
  const savedJoin = req.user ? `LEFT JOIN saved_products sp ON sp.product_id = p.id AND sp.user_id = $2` : '';
  const select = BASE_SELECT.replace('{SAVED_COL}', savedCol).replace('{SAVED_JOIN}', savedJoin);

  const params = req.user ? [req.params.id, req.user.id] : [req.params.id];
  const { rows } = db.query(`${select} WHERE p.id = $1`, params);

  if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
  const product = serializeProduct(rows[0]);

  // Find similar listings (same name+model) at other shops, for "compare prices" widget
  const { rows: otherRows } = db.query(
    `${BASE_SELECT.replace('{SAVED_COL}', '').replace('{SAVED_JOIN}', '')}
     WHERE p.name = $1 AND p.id != $2 ORDER BY p.current_price ASC`,
    [rows[0].name, req.params.id]
  );

  res.json({
    product,
    otherShops: otherRows.map(serializeProduct),
  });
});

// ----------------------------------------------------------------
// POST /api/products/:id/save  (auth required) - toggle wishlist
// ----------------------------------------------------------------
const { requireAuth } = require('../middleware/auth');

router.post('/:id/save', requireAuth, (req, res) => {
  const { rows: product } = db.query('SELECT id FROM products WHERE id = $1', [req.params.id]);
  if (product.length === 0) return res.status(404).json({ error: 'Product not found' });

  const existing = db.query('SELECT id FROM saved_products WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.id]);
  if (existing.rowCount > 0) {
    db.query('DELETE FROM saved_products WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.id]);
    return res.json({ saved: false });
  } else {
    db.query('INSERT INTO saved_products (user_id, product_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
    return res.json({ saved: true });
  }
});

module.exports = router;
