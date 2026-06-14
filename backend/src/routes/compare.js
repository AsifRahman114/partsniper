// routes/compare.js
// ------------------------------------------------------------
// Compares 2+ products side-by-side: prices (across shops if the
// same model is sold by multiple shops) and performance metrics
// derived from each product's `specs` (perfScore for GPU/CPU,
// speedMHz for RAM, readSpeedMBps for SSD, etc).
//
// GET /api/compare?ids=id1,id2,id3
// ------------------------------------------------------------

const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Spec fields treated as "performance" metrics per category, with
// human-readable labels and higher-is-better direction.
const PERF_FIELDS = {
  gpu: [
    { key: 'perfScore', label: 'Performance Score', higherIsBetter: true },
    { key: 'vram', label: 'VRAM (GB)', higherIsBetter: true },
    { key: 'tdpWatts', label: 'TDP (W)', higherIsBetter: false },
  ],
  cpu: [
    { key: 'perfScore', label: 'Performance Score', higherIsBetter: true },
    { key: 'cores', label: 'Cores', higherIsBetter: true },
    { key: 'threads', label: 'Threads', higherIsBetter: true },
    { key: 'baseClockGHz', label: 'Base Clock (GHz)', higherIsBetter: true },
    { key: 'tdpWatts', label: 'TDP (W)', higherIsBetter: false },
  ],
  ram: [
    { key: 'speedMHz', label: 'Speed (MHz)', higherIsBetter: true },
    { key: 'capacityGB', label: 'Capacity (GB)', higherIsBetter: true },
  ],
  ssd: [
    { key: 'readSpeedMBps', label: 'Read Speed (MB/s)', higherIsBetter: true },
    { key: 'capacityGB', label: 'Capacity (GB)', higherIsBetter: true },
  ],
  hdd: [
    { key: 'rpm', label: 'RPM', higherIsBetter: true },
    { key: 'capacityGB', label: 'Capacity (GB)', higherIsBetter: true },
  ],
  motherboard: [
    { key: 'maxRamGB', label: 'Max RAM (GB)', higherIsBetter: true },
    { key: 'ramSlots', label: 'RAM Slots', higherIsBetter: true },
  ],
  monitor: [
    { key: 'refreshRateHz', label: 'Refresh Rate (Hz)', higherIsBetter: true },
    { key: 'sizeInches', label: 'Size (inches)', higherIsBetter: true },
  ],
  laptop: [
    { key: 'ramGB', label: 'RAM (GB)', higherIsBetter: true },
    { key: 'storageGB', label: 'Storage (GB)', higherIsBetter: true },
    { key: 'refreshRateHz', label: 'Display Refresh Rate (Hz)', higherIsBetter: true },
  ],
  psu: [
    { key: 'wattage', label: 'Wattage', higherIsBetter: true },
  ],
  cooler: [
    { key: 'tdpRatingWatts', label: 'TDP Rating (W)', higherIsBetter: true },
  ],
};

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
    shop: { id: row.shop_id, name: row.shop_name, slug: row.shop_slug },
  };
}

// GET /api/compare?ids=id1,id2,id3
router.get('/', (req, res) => {
  const idsParam = req.query.ids;
  if (!idsParam) return res.status(400).json({ error: 'ids query param is required (comma-separated)' });

  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length < 2) return res.status(400).json({ error: 'At least 2 product ids are required for comparison' });
  if (ids.length > 6) return res.status(400).json({ error: 'Maximum 6 products can be compared at once' });

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const { rows } = db.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug, s.name as shop_name, s.slug as shop_slug
     FROM products p
     JOIN categories c ON c.id = p.category_id
     JOIN shops s ON s.id = p.shop_id
     WHERE p.id IN (${placeholders})`,
    ids
  );

  if (rows.length === 0) return res.status(404).json({ error: 'No matching products found' });

  const products = rows.map(serializeProduct);

  // Determine category - all compared items should ideally be the same
  // category for performance comparison to be meaningful, but we don't
  // hard-block cross-category comparisons (e.g. comparing two laptops
  // with different specs is fine; comparing a GPU to a keyboard is allowed
  // but performance section will just show price only).
  const categorySlugs = [...new Set(products.map((p) => p.category.slug))];
  const primaryCategory = categorySlugs.length === 1 ? categorySlugs[0] : null;
  const perfFields = primaryCategory ? (PERF_FIELDS[primaryCategory] || []) : [];

  // Build performance comparison rows, marking the "best" value per field
  const performance = perfFields.map((field) => {
    const values = products.map((p) => {
      const v = p.specs?.[field.key];
      return typeof v === 'number' ? v : null;
    });
    const validValues = values.filter((v) => v != null);
    let bestValue = null;
    if (validValues.length > 0) {
      bestValue = field.higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
    }
    return {
      key: field.key,
      label: field.label,
      higherIsBetter: field.higherIsBetter,
      values: products.map((p, i) => ({
        productId: p.id,
        value: values[i],
        isBest: values[i] != null && values[i] === bestValue && validValues.length > 1,
      })),
    };
  });

  // Price comparison: cheapest highlighted
  const prices = products.map((p) => p.currentPrice);
  const minPrice = Math.min(...prices);

  // "Best value" = best perfScore / price ratio, if a perfScore field exists
  let bestValueProductId = null;
  const perfScoreField = performance.find((f) => f.key === 'perfScore');
  if (perfScoreField) {
    let bestRatio = -Infinity;
    products.forEach((p, i) => {
      const score = perfScoreField.values[i].value;
      if (score != null && p.currentPrice > 0) {
        const ratio = score / p.currentPrice;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestValueProductId = p.id;
        }
      }
    });
  }

  res.json({
    products: products.map((p) => ({
      ...p,
      isCheapest: p.currentPrice === minPrice,
      isBestValue: p.id === bestValueProductId,
    })),
    category: primaryCategory,
    performance,
  });
});

module.exports = router;
