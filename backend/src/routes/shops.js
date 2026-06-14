// routes/shops.js
const express = require('express');
const db = require('../config/db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ----------------------------------------------------------------
// GET /api/shops  - list all shops with avg rating + rating count
// ----------------------------------------------------------------
router.get('/', optionalAuth, (req, res) => {
  const { rows } = db.query(`
    SELECT
      s.id, s.name, s.slug, s.base_url, s.logo_url, s.last_scraped_at,
      ROUND(AVG(r.rating), 2) as avg_rating,
      COUNT(r.id) as rating_count
    FROM shops s
    LEFT JOIN shop_ratings r ON r.shop_id = s.id
    WHERE s.is_active = 1
    GROUP BY s.id
    ORDER BY s.name
  `);

  let myRatings = {};
  if (req.user) {
    const { rows: mine } = db.query('SELECT shop_id, rating FROM shop_ratings WHERE user_id = $1', [req.user.id]);
    myRatings = Object.fromEntries(mine.map((r) => [r.shop_id, r.rating]));
  }

  const shops = rows.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    baseUrl: s.base_url,
    logoUrl: s.logo_url,
    lastScrapedAt: s.last_scraped_at,
    avgRating: s.avg_rating != null ? Number(s.avg_rating) : null,
    ratingCount: s.rating_count,
    myRating: myRatings[s.id] || null,
  }));

  res.json({ shops });
});

// ----------------------------------------------------------------
// GET /api/shops/:id - single shop detail
// ----------------------------------------------------------------
router.get('/:id', optionalAuth, (req, res) => {
  const { rows } = db.query(`
    SELECT
      s.id, s.name, s.slug, s.base_url, s.logo_url, s.last_scraped_at,
      ROUND(AVG(r.rating), 2) as avg_rating,
      COUNT(r.id) as rating_count
    FROM shops s
    LEFT JOIN shop_ratings r ON r.shop_id = s.id
    WHERE s.id = $1
    GROUP BY s.id
  `, [req.params.id]);

  if (rows.length === 0) return res.status(404).json({ error: 'Shop not found' });

  const s = rows[0];
  let myRating = null;
  if (req.user) {
    const { rows: mine } = db.query('SELECT rating FROM shop_ratings WHERE shop_id = $1 AND user_id = $2', [s.id, req.user.id]);
    myRating = mine[0]?.rating || null;
  }

  const { rows: productCount } = db.query('SELECT COUNT(*) as cnt FROM products WHERE shop_id = $1', [s.id]);

  res.json({
    shop: {
      id: s.id,
      name: s.name,
      slug: s.slug,
      baseUrl: s.base_url,
      logoUrl: s.logo_url,
      lastScrapedAt: s.last_scraped_at,
      avgRating: s.avg_rating != null ? Number(s.avg_rating) : null,
      ratingCount: s.rating_count,
      myRating,
      productCount: productCount[0].cnt,
    },
  });
});

// ----------------------------------------------------------------
// POST /api/shops/:id/rate  (auth required) - rate a shop 1-5
// Upserts: one rating per user per shop (can be updated)
// ----------------------------------------------------------------
router.post('/:id/rate', requireAuth, (req, res) => {
  const { rating, reviewText } = req.body;
  const shopId = req.params.id;

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
  }

  const { rows: shop } = db.query('SELECT id FROM shops WHERE id = $1', [shopId]);
  if (shop.length === 0) return res.status(404).json({ error: 'Shop not found' });

  const existing = db.query('SELECT id FROM shop_ratings WHERE shop_id = $1 AND user_id = $2', [shopId, req.user.id]);
  if (existing.rowCount > 0) {
    db.query('UPDATE shop_ratings SET rating = $1, review_text = $2 WHERE shop_id = $3 AND user_id = $4', [
      rating, reviewText || null, shopId, req.user.id,
    ]);
  } else {
    db.query('INSERT INTO shop_ratings (shop_id, user_id, rating, review_text) VALUES ($1,$2,$3,$4)', [
      shopId, req.user.id, rating, reviewText || null,
    ]);
  }

  const { rows: agg } = db.query(
    'SELECT ROUND(AVG(rating),2) as avg_rating, COUNT(*) as cnt FROM shop_ratings WHERE shop_id = $1',
    [shopId]
  );

  res.json({
    message: 'Rating submitted',
    avgRating: Number(agg[0].avg_rating),
    ratingCount: agg[0].cnt,
    myRating: rating,
  });
});

module.exports = router;
