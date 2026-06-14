// scrapers/genericScraper.js
// ------------------------------------------------------------
// A configuration-driven scraper for shops whose listing pages
// follow a common "card grid" pattern (very common among BD
// e-commerce storefronts built on similar templates/themes).
//
// Rather than duplicating near-identical class bodies for each
// of the remaining shops (ComputerMania, UCC, Potaka IT, PC House,
// EZ Gadgets, Bengal PC, Tech Monster), each shop gets a small
// config object describing its CSS selectors and category URL
// paths, and GenericScraper does the parsing.
//
// If a shop's markup diverges significantly enough that this
// generic approach breaks, give it its own subclass (as done for
// Star Tech, Techland, and Ryans) — GenericScraper is a starting
// point/fallback, not a guarantee.
// ------------------------------------------------------------

const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

const MAX_PAGES_PER_CATEGORY = 5;

class GenericScraper extends BaseScraper {
  /**
   * @param {object} config
   * @param {string} config.shopSlug
   * @param {string} config.baseUrl
   * @param {object} config.categoryPaths - slug -> URL path
   * @param {object} config.selectors - CSS selectors, see DEFAULT_SELECTORS
   * @param {string} [config.pageParam] - query param for pagination, default "page"
   */
  constructor(config) {
    super({ shopSlug: config.shopSlug, baseUrl: config.baseUrl });
    this.categoryPaths = config.categoryPaths;
    this.pageParam = config.pageParam || 'page';
    this.selectors = {
      item: '.product-item, .product-card, .card.product, .p-item',
      name: '.product-name a, .product-title a, h3 a, h4 a, .title a',
      image: 'img',
      priceNew: '.price, .current-price, .special-price, .price-new',
      priceOld: '.old-price, .price-old, del',
      stock: '.stock, .stock-status, .badge, .label',
      pagination: '.pagination a, .pages a, a.next',
      ...config.selectors,
    };
  }

  async scrapeCategory(categorySlug) {
    const path = this.categoryPaths[categorySlug];
    if (!path) {
      console.warn(`[${this.shopSlug}] No category path mapped for "${categorySlug}", skipping.`);
      return [];
    }

    const products = [];
    for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
      const sep = path.includes('?') ? '&' : '?';
      const url = page > 1 ? `${this.baseUrl}${path}${sep}${this.pageParam}=${page}` : `${this.baseUrl}${path}`;

      let html;
      try {
        html = await this.fetchHtml(url);
      } catch (err) {
        console.error(`[${this.shopSlug}] Failed to fetch ${url}: ${err.message}`);
        break;
      }

      const $ = cheerio.load(html);
      const items = $(this.selectors.item);
      if (items.length === 0) break;

      items.each((_, el) => {
        const product = this._parseItem($, el, categorySlug);
        if (product) products.push(product);
      });

      const hasNext = $(this.selectors.pagination).filter((_, a) => /next|»|›/i.test($(a).text() + ($(a).attr('rel') || ''))).length > 0;
      if (!hasNext) break;
    }

    return products;
  }

  _parseItem($, el, categorySlug) {
    const $el = $(el);

    const nameAnchor = $el.find(this.selectors.name).first();
    const name = nameAnchor.text().trim();
    const productUrl = this.resolveUrl(nameAnchor.attr('href'));
    if (!name || !productUrl) return null;

    const externalId = productUrl.split('/').filter(Boolean).pop().replace(/\.html?$/, '');

    const img = $el.find(this.selectors.image).first();
    let imageUrl = img.attr('data-src') || img.attr('data-original') || img.attr('src') || null;
    imageUrl = this.resolveUrl(imageUrl);

    const newPriceText = $el.find(this.selectors.priceNew).first().text();
    const oldPriceText = $el.find(this.selectors.priceOld).first().text();

    let currentPrice = BaseScraper.parsePrice(newPriceText);
    let originalPrice = BaseScraper.parsePrice(oldPriceText);

    if (currentPrice == null) {
      console.warn(`[${this.shopSlug}] Skipping "${name}": could not parse price from "${newPriceText}"`);
      return null;
    }
    if (originalPrice != null && originalPrice <= currentPrice) originalPrice = null;

    const stockText = $el.find(this.selectors.stock).first().text().trim().toLowerCase();
    const inStock = !/out of stock|stock out|unavailable|sold out/.test(stockText);

    const brand = name.split(' ')[0] || null;

    return {
      externalId,
      name,
      brand,
      model: null,
      categorySlug,
      imageUrl,
      productUrl,
      currentPrice,
      originalPrice,
      offerEndsAt: null,
      inStock,
      specs: {},
    };
  }

  async scrapeAll() {
    const all = [];
    for (const categorySlug of Object.keys(this.categoryPaths)) {
      console.log(`[${this.shopSlug}] Scraping category: ${categorySlug}`);
      const items = await this.scrapeCategory(categorySlug);
      console.log(`[${this.shopSlug}]   -> ${items.length} items`);
      all.push(...items);
      await new Promise((r) => setTimeout(r, 1000));
    }
    return all;
  }
}

// ----------------------------------------------------------------
// Per-shop configs for the remaining 7 retailers.
// Category URL paths are best-guess based on typical structures for
// each platform; verify and adjust against the live site if a
// category returns 0 items (some shops nest under /category/... or
// use different slugs — run a quick scrapeCategory() test per shop).
// ----------------------------------------------------------------

const SHOP_CONFIGS = {
  computermania: {
    shopSlug: 'computermania',
    baseUrl: 'https://www.computermania.com.bd',
    categoryPaths: {
      gpu: '/category/graphics-card',
      cpu: '/category/processor',
      motherboard: '/category/motherboard',
      ram: '/category/ram',
      ssd: '/category/ssd',
      hdd: '/category/hdd',
      psu: '/category/power-supply',
      casing: '/category/casing',
      monitor: '/category/monitor',
      laptop: '/category/laptop',
      keyboard: '/category/keyboard',
      mouse: '/category/mouse',
      headphone: '/category/headphone',
      cooler: '/category/cooler',
    },
  },
  ucc: {
    shopSlug: 'ucc',
    baseUrl: 'https://www.ucc.com.bd',
    categoryPaths: {
      gpu: '/index.php?route=product/category&path=graphics-card',
      cpu: '/index.php?route=product/category&path=processor',
      motherboard: '/index.php?route=product/category&path=motherboard',
      ram: '/index.php?route=product/category&path=ram',
      ssd: '/index.php?route=product/category&path=ssd',
      hdd: '/index.php?route=product/category&path=hdd',
      psu: '/index.php?route=product/category&path=power-supply',
      casing: '/index.php?route=product/category&path=casing',
      monitor: '/index.php?route=product/category&path=monitor',
      laptop: '/index.php?route=product/category&path=laptop',
      keyboard: '/index.php?route=product/category&path=keyboard',
      mouse: '/index.php?route=product/category&path=mouse',
      headphone: '/index.php?route=product/category&path=headphone',
      cooler: '/index.php?route=product/category&path=cooler',
    },
    pageParam: 'page',
    selectors: {
      // OpenCart-style markup
      item: '.product-layout, .product-thumb',
      name: '.caption a, h4 a',
      priceNew: '.price-new, .price',
      priceOld: '.price-old',
      stock: '.stock',
    },
  },
  potaka: {
    shopSlug: 'potaka',
    baseUrl: 'https://www.potakait.com',
    categoryPaths: {
      gpu: '/graphics-card',
      cpu: '/processor',
      motherboard: '/motherboard',
      ram: '/ram',
      ssd: '/ssd',
      hdd: '/hdd',
      psu: '/power-supply',
      casing: '/casing',
      monitor: '/monitor',
      laptop: '/laptop',
      keyboard: '/keyboard',
      mouse: '/mouse',
      headphone: '/headphone',
      cooler: '/cooler',
    },
  },
  pchouse: {
    shopSlug: 'pchouse',
    baseUrl: 'https://www.pchouse.com.bd',
    categoryPaths: {
      gpu: '/product-category/graphics-card',
      cpu: '/product-category/processor',
      motherboard: '/product-category/motherboard',
      ram: '/product-category/ram',
      ssd: '/product-category/ssd',
      hdd: '/product-category/hdd',
      psu: '/product-category/power-supply',
      casing: '/product-category/casing',
      monitor: '/product-category/monitor',
      laptop: '/product-category/laptop',
      keyboard: '/product-category/keyboard',
      mouse: '/product-category/mouse',
      headphone: '/product-category/headphone',
      cooler: '/product-category/cpu-cooler',
    },
    pageParam: 'page',
    selectors: {
      // WooCommerce-style markup
      item: '.product, li.product',
      name: '.woocommerce-loop-product__title, h2 a, a.woocommerce-LoopProduct-link',
      priceNew: '.price ins .woocommerce-Price-amount, .price .woocommerce-Price-amount',
      priceOld: '.price del .woocommerce-Price-amount',
      stock: '.stock',
    },
  },
  ezgadgets: {
    shopSlug: 'ezgadgets',
    baseUrl: 'https://www.ezgadgets.com.bd',
    categoryPaths: {
      gpu: '/product-category/components/graphics-card',
      cpu: '/product-category/components/processor',
      motherboard: '/product-category/components/motherboard',
      ram: '/product-category/components/ram',
      ssd: '/product-category/storage/ssd',
      hdd: '/product-category/storage/hdd',
      psu: '/product-category/components/power-supply',
      casing: '/product-category/components/casing',
      monitor: '/product-category/monitor',
      laptop: '/product-category/laptop',
      keyboard: '/product-category/accessories/keyboard',
      mouse: '/product-category/accessories/mouse',
      headphone: '/product-category/accessories/headphone',
      cooler: '/product-category/components/cooler',
    },
    pageParam: 'page',
    selectors: {
      item: '.product, li.product',
      name: '.woocommerce-loop-product__title, h2 a',
      priceNew: '.price ins .woocommerce-Price-amount, .price .woocommerce-Price-amount',
      priceOld: '.price del .woocommerce-Price-amount',
      stock: '.stock',
    },
  },
  bengalpc: {
    shopSlug: 'bengalpc',
    baseUrl: 'https://www.bengalpc.com',
    categoryPaths: {
      gpu: '/graphics-card',
      cpu: '/processor',
      motherboard: '/motherboard',
      ram: '/ram',
      ssd: '/ssd',
      hdd: '/hdd',
      psu: '/power-supply',
      casing: '/casing',
      monitor: '/monitor',
      laptop: '/laptop',
      keyboard: '/keyboard',
      mouse: '/mouse',
      headphone: '/headphone',
      cooler: '/cooler',
    },
  },
  techmonster: {
    shopSlug: 'techmonster',
    baseUrl: 'https://www.techmonsterbd.com',
    categoryPaths: {
      gpu: '/product-category/graphics-card',
      cpu: '/product-category/processor',
      motherboard: '/product-category/motherboard',
      ram: '/product-category/ram',
      ssd: '/product-category/ssd',
      hdd: '/product-category/hdd',
      psu: '/product-category/power-supply',
      casing: '/product-category/casing',
      monitor: '/product-category/monitor',
      laptop: '/product-category/laptop',
      keyboard: '/product-category/keyboard',
      mouse: '/product-category/mouse',
      headphone: '/product-category/headphone',
      cooler: '/product-category/cooler',
    },
    pageParam: 'page',
    selectors: {
      item: '.product, li.product',
      name: '.woocommerce-loop-product__title, h2 a',
      priceNew: '.price ins .woocommerce-Price-amount, .price .woocommerce-Price-amount',
      priceOld: '.price del .woocommerce-Price-amount',
      stock: '.stock',
    },
  },
};

function createScraper(shopSlug) {
  const config = SHOP_CONFIGS[shopSlug];
  if (!config) throw new Error(`No generic scraper config for shop "${shopSlug}"`);
  return new GenericScraper(config);
}

module.exports = { GenericScraper, SHOP_CONFIGS, createScraper };
