// seed/seed.js
// ------------------------------------------------------------
// Populates the sandbox database with realistic product listings
// across all 10 shops, derived from the curated base-product
// datasets in seed/data/*.js.
//
// For each base product, this script:
//  - Picks a random subset of shops (3-7) that "carry" it
//  - Applies realistic per-shop price variance (+/- 0-8%)
//  - Randomly applies a discount (originalPrice + offerEndsAt)
//    to ~30% of listings
//  - Randomly marks ~5% as out-of-stock
//  - Generates a placeholder image URL (picsum, seeded by name)
//
// This produces output in the EXACT same shape that
// productService.upsertProduct() expects from a real scraper,
// so the rest of the app (API, frontend) works identically once
// real scrapers are swapped in.
//
// Run: node src/seed/seed.js
// ------------------------------------------------------------

const db = require('../config/db');
const { upsertMany } = require('../services/productService');

const CATEGORY_DATA = {
  gpu: require('./data/gpu'),
  cpu: require('./data/cpu'),
  motherboard: require('./data/motherboard'),
  ram: require('./data/ram'),
  ssd: require('./data/ssd'),
  hdd: require('./data/hdd'),
  psu: require('./data/psu'),
  casing: require('./data/casing'),
  monitor: require('./data/monitor'),
  laptop: require('./data/laptop'),
  keyboard: require('./data/keyboard'),
  mouse: require('./data/mouse'),
  headphone: require('./data/headphone'),
  cooler: require('./data/cooler'),
};

const SHOP_SLUGS = [
  'startech', 'techland', 'ryans', 'computermania', 'ucc',
  'potaka', 'pchouse', 'ezgadgets', 'bengalpc', 'techmonster',
];

const SHOP_DISPLAY = {
  startech: 'Star Tech', techland: 'Techland BD', ryans: 'Ryans Computers',
  computermania: 'ComputerMania BD', ucc: 'UCC BD', potaka: 'Potaka IT',
  pchouse: 'PC House', ezgadgets: 'EZ Gadgets', bengalpc: 'Bengal PC',
  techmonster: 'Tech Monster BD',
};

function seededRandom(seed) {
  // simple LCG for deterministic-ish output per run (good enough for seed data)
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function shuffle(arr, rand) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function roundToNearest(num, nearest = 50) {
  return Math.round(num / nearest) * nearest;
}

function buildProductUrl(shopSlug, categorySlug, productSlug) {
  const bases = {
    startech: `https://www.startech.com.bd/${categorySlug}/${productSlug}`,
    techland: `https://www.techlandbd.com/${productSlug}.html`,
    ryans: `https://www.ryans.com/${categorySlug}/${productSlug}`,
    computermania: `https://www.computermania.com.bd/product/${productSlug}`,
    ucc: `https://www.ucc.com.bd/${productSlug}`,
    potaka: `https://www.potakait.com/${productSlug}`,
    pchouse: `https://www.pchouse.com.bd/product/${productSlug}`,
    ezgadgets: `https://www.ezgadgets.com.bd/product/${productSlug}`,
    bengalpc: `https://www.bengalpc.com/${productSlug}`,
    techmonster: `https://www.techmonsterbd.com/product/${productSlug}`,
  };
  return bases[shopSlug];
}

function buildImageUrl(productName) {
  // Deterministic placeholder image per product (picsum with seed)
  const seed = encodeURIComponent(slugify(productName));
  return `https://picsum.photos/seed/${seed}/400/400`;
}

function generateListings() {
  const rand = seededRandom(20260613);
  const listings = []; // { shopSlug, normalized }

  for (const [categorySlug, products] of Object.entries(CATEGORY_DATA)) {
    for (const base of products) {
      const productSlug = slugify(base.name);

      // Pick how many shops carry this item (3-7)
      const numShops = 3 + Math.floor(rand() * 5);
      const shopsForItem = shuffle(SHOP_SLUGS, rand).slice(0, numShops);

      for (const shopSlug of shopsForItem) {
        // Price variance: +/- 0% to 8%
        const variance = 1 + (rand() * 0.16 - 0.08);
        let currentPrice = roundToNearest(base.basePrice * variance, 50);

        // ~30% chance of discount
        let originalPrice = null;
        let offerEndsAt = null;
        if (rand() < 0.3) {
          const discountPct = 0.05 + rand() * 0.2; // 5%-25% off
          originalPrice = roundToNearest(currentPrice / (1 - discountPct), 50);
          // Offer ends 1-21 days from "now" (June 13, 2026)
          const daysAhead = 1 + Math.floor(rand() * 21);
          const end = new Date('2026-06-13T00:00:00Z');
          end.setDate(end.getDate() + daysAhead);
          offerEndsAt = end.toISOString();
        }

        // ~5% out of stock
        const inStock = rand() >= 0.05;

        listings.push({
          shopSlug,
          normalized: {
            externalId: `${productSlug}-${shopSlug}`,
            name: base.name,
            brand: base.brand,
            model: base.model,
            categorySlug,
            imageUrl: buildImageUrl(base.name),
            productUrl: buildProductUrl(shopSlug, categorySlug, productSlug),
            currentPrice,
            originalPrice,
            offerEndsAt,
            inStock,
            specs: base.specs,
          },
        });
      }
    }
  }

  return listings;
}

function seedShopRatings() {
  // Generate a handful of demo ratings per shop so avg ratings show
  // up on the dashboard immediately. Real ratings come from users
  // via POST /api/shops/:id/rate.
  const rand = seededRandom(7);
  const { rows: shops } = db.query('SELECT id, slug FROM shops');

  // Create a few demo "seed" users to attribute ratings to, so the
  // UNIQUE(shop_id, user_id) constraint is respected and ratings
  // don't collide with real signups.
  const demoUserIds = [];
  for (let i = 0; i < 12; i++) {
    const id = `seed-rater-${i}`;
    const exists = db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (exists.rowCount === 0) {
      db.query(
        `INSERT INTO users (id, username, email, password_hash, email_verified)
         VALUES ($1,$2,$3,$4,1)`,
        [id, `demo_rater_${i}`, `demo.rater.${i}@example.com`, '$2b$12$invalidhashforseeduseronly0000000000000000000']
      );
    }
    demoUserIds.push(id);
  }

  // Rough baseline quality per shop (reflects general BD market reputation
  // patterns for demo purposes; real ratings will shift these over time).
  const baseline = {
    startech: 4.3, techland: 4.1, ryans: 4.4, computermania: 3.9,
    ucc: 3.8, potaka: 4.0, pchouse: 3.7, ezgadgets: 3.9,
    bengalpc: 3.6, techmonster: 3.8,
  };

  for (const shop of shops) {
    const base = baseline[shop.slug] ?? 4.0;
    const numRatings = 4 + Math.floor(rand() * 8); // 4-11 ratings
    const ratersForShop = shuffle(demoUserIds, rand).slice(0, Math.min(numRatings, demoUserIds.length));

    for (const userId of ratersForShop) {
      // Rating clusters around `base`, clamped to 1-5, rounded to int
      let r = Math.round(base + (rand() * 2 - 1));
      r = Math.max(1, Math.min(5, r));
      const exists = db.query('SELECT id FROM shop_ratings WHERE shop_id = $1 AND user_id = $2', [shop.id, userId]);
      if (exists.rowCount === 0) {
        db.query('INSERT INTO shop_ratings (shop_id, user_id, rating) VALUES ($1, $2, $3)', [shop.id, userId, r]);
      }
    }
  }
}

function seedBenchmarks() {
  // Benchmark scores used by PC Builder perf-per-taka calc, keyed by
  // chipset/model string matching `specs.chipset` / model in CPU/GPU data.
  // We already embed perfScore directly in seed specs, so this is mainly
  // a placeholder for future expansion (e.g. separate gaming vs productivity
  // scores). Left intentionally minimal.
}

async function main() {
  await db.init();

  console.log('Generating product listings...');
  const listings = generateListings();
  console.log(`Generated ${listings.length} listings across ${SHOP_SLUGS.length} shops`);

  // Group by shop and upsert
  const byShop = {};
  for (const { shopSlug, normalized } of listings) {
    (byShop[shopSlug] = byShop[shopSlug] || []).push(normalized);
  }

  let total = 0;
  for (const [shopSlug, items] of Object.entries(byShop)) {
    const count = upsertMany(shopSlug, items);
    console.log(`  ${SHOP_DISPLAY[shopSlug]}: ${count} products`);
    total += count;
  }
  console.log(`Total products upserted: ${total}`);

  console.log('Seeding shop ratings...');
  seedShopRatings();

  console.log('Done.');
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { generateListings };
