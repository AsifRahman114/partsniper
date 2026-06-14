// routes/builder.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { checkCompatibility, computePerfScore, computeTotalPrice } = require('../services/compatibilityEngine');
const { optimizeBuild, getCandidates, CATEGORY_TO_BUILD_KEY } = require('../services/buildOptimizer');

const router = express.Router();

function serializeProduct(row) {
  if (!row) return null;
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
    inStock: !!row.in_stock,
    specs: (() => { try { return JSON.parse(row.specs || '{}'); } catch { return {}; } })(),
    shop: row.shop_name ? { id: row.shop_id, name: row.shop_name, slug: row.shop_slug } : undefined,
  };
}

// ----------------------------------------------------------------
// GET /api/builder/components?category=gpu&sort=price_asc
// Returns build-eligible products for a single category, sorted
// by price or by perf-per-taka. Used to populate "pick a part"
// dropdowns/modals.
// ----------------------------------------------------------------
router.get('/components', (req, res) => {
  const { category, sort } = req.query;
  if (!category || !CATEGORY_TO_BUILD_KEY[category]) {
    return res.status(400).json({ error: `category must be one of: ${Object.keys(CATEGORY_TO_BUILD_KEY).join(', ')}` });
  }

  const { rows } = db.query(
    `SELECT p.*, s.name as shop_name, s.slug as shop_slug
     FROM products p JOIN shops s ON s.id = p.shop_id
     JOIN categories c ON c.id = p.category_id
     WHERE c.slug = $1 AND p.in_stock = 1
     ORDER BY ${sort === 'price_desc' ? 'p.current_price DESC' : 'p.current_price ASC'}`,
    [category]
  );

  res.json({ products: rows.map(serializeProduct) });
});

// ----------------------------------------------------------------
// POST /api/builder/check
// Body: { build: { CPU: productId, GPU: productId, ... } }
// Returns compatibility issues + perf score + total price for an
// arbitrary user-selected combination.
// ----------------------------------------------------------------
router.post('/check', (req, res) => {
  const { build: buildIds } = req.body;
  if (!buildIds || typeof buildIds !== 'object') {
    return res.status(400).json({ error: 'build object is required, e.g. { "CPU": "<id>", "GPU": "<id>" }' });
  }

  const ids = Object.values(buildIds).filter(Boolean);
  if (ids.length === 0) return res.status(400).json({ error: 'build must contain at least one component id' });

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = db.query(
    `SELECT p.*, s.name as shop_name, s.slug as shop_slug
     FROM products p JOIN shops s ON s.id = p.shop_id
     WHERE p.id IN (${placeholders})`,
    ids
  );
  const byId = Object.fromEntries(rows.map((r) => [r.id, serializeProduct(r)]));

  const build = {};
  for (const [key, id] of Object.entries(buildIds)) {
    if (id && byId[id]) build[key] = byId[id];
  }

  const compatibility = checkCompatibility(build);
  res.json({
    build,
    totalPrice: computeTotalPrice(build),
    perfScore: computePerfScore(build),
    compatibility,
  });
});

// ----------------------------------------------------------------
// POST /api/builder/optimize
// Body: { budget: number, includeMonitor?: boolean, locked?: { CPU: productId, ... } }
// Returns an auto-generated compatible build maximizing perf/taka
// within the given budget.
// ----------------------------------------------------------------
router.post('/optimize', (req, res) => {
  const { budget, includeMonitor = true, locked: lockedIds = {} } = req.body;

  if (!budget || typeof budget !== 'number' || budget <= 0) {
    return res.status(400).json({ error: 'budget (number > 0, in BDT) is required' });
  }

  // Resolve locked product ids -> full product objects
  const locked = {};
  const lockedIdList = Object.values(lockedIds).filter(Boolean);
  if (lockedIdList.length > 0) {
    const placeholders = lockedIdList.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = db.query(
      `SELECT p.*, s.name as shop_name, s.slug as shop_slug
       FROM products p JOIN shops s ON s.id = p.shop_id
       WHERE p.id IN (${placeholders})`,
      lockedIdList
    );
    const byId = Object.fromEntries(rows.map((r) => [r.id, serializeProduct(r)]));
    for (const [key, id] of Object.entries(lockedIds)) {
      if (id && byId[id]) locked[key] = byId[id];
    }
  }

  const result = optimizeBuild(budget, { includeMonitor, locked });
  if (result.error) {
    return res.status(422).json(result);
  }
  res.json(result);
});

// ----------------------------------------------------------------
// POST /api/builder/save  (optionalAuth - guests get an id but
// can't retrieve it later without an account)
// Body: { name?, budget?, build: { CPU: productId, ... } }
// ----------------------------------------------------------------
router.post('/save', optionalAuth, (req, res) => {
  const { name, budget, build: buildIds } = req.body;
  if (!buildIds || typeof buildIds !== 'object' || Object.keys(buildIds).length === 0) {
    return res.status(400).json({ error: 'build object is required' });
  }

  const ids = Object.values(buildIds).filter(Boolean);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = db.query(
    `SELECT p.*, s.name as shop_name, s.slug as shop_slug
     FROM products p JOIN shops s ON s.id = p.shop_id
     WHERE p.id IN (${placeholders})`,
    ids
  );
  const byId = Object.fromEntries(rows.map((r) => [r.id, serializeProduct(r)]));
  const build = {};
  for (const [key, id] of Object.entries(buildIds)) {
    if (id && byId[id]) build[key] = byId[id];
  }

  const totalPrice = computeTotalPrice(build);
  const perfScore = computePerfScore(build);

  const id = uuidv4();
  db.query(
    `INSERT INTO pc_builds (id, user_id, name, budget, components, total_price, perf_score)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, req.user?.id || null, name || 'My Build', budget || null, JSON.stringify(buildIds), totalPrice, perfScore]
  );

  res.status(201).json({ id, message: 'Build saved', totalPrice, perfScore });
});

// ----------------------------------------------------------------
// GET /api/builder/saved  (auth required) - list current user's saved builds
// ----------------------------------------------------------------
router.get('/saved', requireAuth, (req, res) => {
  const { rows } = db.query(
    `SELECT id, name, budget, total_price, perf_score, created_at, updated_at
     FROM pc_builds WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ builds: rows });
});

// ----------------------------------------------------------------
// GET /api/builder/saved/:id - load a saved build (with full product details)
// ----------------------------------------------------------------
router.get('/saved/:id', optionalAuth, (req, res) => {
  const { rows } = db.query('SELECT * FROM pc_builds WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Build not found' });
  const saved = rows[0];

  // If the build belongs to a user, only that user can view it
  if (saved.user_id && (!req.user || req.user.id !== saved.user_id)) {
    return res.status(403).json({ error: 'You do not have access to this build' });
  }

  const buildIds = JSON.parse(saved.components);
  const ids = Object.values(buildIds).filter(Boolean);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const { rows: productRows } = db.query(
    `SELECT p.*, s.name as shop_name, s.slug as shop_slug
     FROM products p JOIN shops s ON s.id = p.shop_id
     WHERE p.id IN (${placeholders})`,
    ids
  );
  const byId = Object.fromEntries(productRows.map((r) => [r.id, serializeProduct(r)]));
  const build = {};
  for (const [key, id] of Object.entries(buildIds)) {
    if (id && byId[id]) build[key] = byId[id];
  }

  res.json({
    id: saved.id,
    name: saved.name,
    budget: saved.budget,
    build,
    totalPrice: saved.total_price,
    perfScore: saved.perf_score,
    compatibility: checkCompatibility(build),
    createdAt: saved.created_at,
  });
});

module.exports = router;
