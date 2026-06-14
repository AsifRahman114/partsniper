// scrapers/runScrapers.js
// ------------------------------------------------------------
// Orchestrates running all shop scrapers and upserting results.
// Can be invoked:
//   - manually:        node src/scrapers/runScrapers.js [shopSlug]
//   - via cron:        scheduled in src/index.js with node-cron
//   - via admin route: POST /api/admin/scrape (optional)
//
// NOTE: This requires outbound network access to the shop
// domains, which is NOT available in this sandbox (egress is
// allowlisted to npm/pip/github only). Running this script here
// will fail with network errors — that's expected. In a normal
// deployment (any VPS/cloud host with standard internet access)
// this runs as-is.
// ------------------------------------------------------------

const db = require('../config/db');
const { upsertMany } = require('../services/productService');
const StartechScraper = require('./startechScraper');
const TechlandScraper = require('./techlandScraper');
const RyansScraper = require('./ryansScraper');
const { createScraper, SHOP_CONFIGS } = require('./genericScraper');

const SCRAPERS = {
  startech: () => new StartechScraper(),
  techland: () => new TechlandScraper(),
  ryans: () => new RyansScraper(),
  ...Object.fromEntries(Object.keys(SHOP_CONFIGS).map((slug) => [slug, () => createScraper(slug)])),
};

async function runShop(shopSlug) {
  const factory = SCRAPERS[shopSlug];
  if (!factory) {
    console.error(`No scraper registered for shop "${shopSlug}"`);
    return;
  }

  const { rows } = db.query('SELECT id FROM shops WHERE slug = $1', [shopSlug]);
  const shopId = rows[0]?.id;

  const startedAt = new Date().toISOString();
  let status = 'success';
  let itemsFound = 0;
  let errorMsg = null;

  try {
    const scraper = factory();
    const items = await scraper.scrapeAll();
    itemsFound = upsertMany(shopSlug, items);
    if (items.length === 0) status = 'partial';
  } catch (err) {
    status = 'failed';
    errorMsg = err.message;
    console.error(`[runScrapers] ${shopSlug} failed:`, err.message);
  }

  if (shopId) {
    db.query(
      `INSERT INTO scrape_logs (shop_id, status, items_found, error_msg, started_at, finished_at)
       VALUES ($1,$2,$3,$4,$5,datetime('now'))`,
      [shopId, status, itemsFound, errorMsg, startedAt]
    );
    db.query(`UPDATE shops SET last_scraped_at = datetime('now') WHERE id = $1`, [shopId]);
  }

  console.log(`[runScrapers] ${shopSlug}: ${status}, ${itemsFound} products upserted`);
  return { shopSlug, status, itemsFound, errorMsg };
}

async function runAll() {
  const results = [];
  for (const shopSlug of Object.keys(SCRAPERS)) {
    results.push(await runShop(shopSlug));
  }
  return results;
}

// CLI entry point
if (require.main === module) {
  (async () => {
    await db.init();
    const target = process.argv[2];
    if (target) {
      await runShop(target);
    } else {
      await runAll();
    }
    process.exit(0);
  })();
}

module.exports = { runShop, runAll, SCRAPERS };
