// scrapers/startechScraper.js
// ------------------------------------------------------------
// Scraper for Star Tech (https://www.startech.com.bd)
//
// Star Tech's category listing pages follow the pattern:
//   https://www.startech.com.bd/{category-path}?page=N
// Each product is rendered as a `.p-item` card containing:
//   .p-item-name a              -> product name + link
//   .p-item-img img              -> image (data-src or src)
//   .price-new / .price-current  -> current price
//   .price-old                   -> original price (if discounted)
//   .p-item-stock .label         -> stock status text
//
// Selectors below are based on Star Tech's storefront markup as of
// the most recent observation. Storefronts change their HTML over
// time, so this scraper is intentionally defensive: it tries
// several selector fallbacks per field and logs a warning (rather
// than throwing) if a field can't be found, so one broken selector
// doesn't take down the whole scrape.
// ------------------------------------------------------------

const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

// Map our canonical category slugs -> Star Tech category URL paths
const CATEGORY_PATHS = {
  gpu: '/component/graphics-card',
  cpu: '/component/processor',
  motherboard: '/component/motherboard',
  ram: '/component/ram',
  ssd: '/component/ssd',
  hdd: '/component/hard-disk-drive',
  psu: '/component/power-supply',
  casing: '/component/casing',
  monitor: '/monitor',
  laptop: '/laptop',
  keyboard: '/peripheral/keyboard',
  mouse: '/peripheral/mouse',
  headphone: '/peripheral/headphone',
  cooler: '/component/cooler',
};

const MAX_PAGES_PER_CATEGORY = 5; // safety cap; adjust per needs

class StartechScraper extends BaseScraper {
  constructor() {
    super({ shopSlug: 'startech', baseUrl: 'https://www.startech.com.bd' });
  }

  /**
   * Scrapes a single category across paginated listing pages.
   */
  async scrapeCategory(categorySlug) {
    const path = CATEGORY_PATHS[categorySlug];
    if (!path) {
      console.warn(`[startech] No category path mapped for "${categorySlug}", skipping.`);
      return [];
    }

    const products = [];
    for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
      const url = `${this.baseUrl}${path}${page > 1 ? `?page=${page}` : ''}`;
      let html;
      try {
        html = await this.fetchHtml(url);
      } catch (err) {
        console.error(`[startech] Failed to fetch ${url}: ${err.message}`);
        break;
      }

      const $ = cheerio.load(html);
      const items = $('.p-item');
      if (items.length === 0) break; // no more pages

      items.each((_, el) => {
        const product = this._parseItem($, el, categorySlug);
        if (product) products.push(product);
      });

      // Stop if this is the last page (no pagination link to a higher page)
      const hasNextPage = $(`.pagination a[href*="page=${page + 1}"]`).length > 0;
      if (!hasNextPage) break;
    }

    return products;
  }

  /**
   * Parses one `.p-item` card into a normalized product.
   * Returns null (and logs a warning) if essential fields are missing.
   */
  _parseItem($, el, categorySlug) {
    const $el = $(el);

    // --- Name + URL ---
    const nameAnchor = $el.find('.p-item-name a, h4 a').first();
    const name = nameAnchor.text().trim();
    const productUrl = this.resolveUrl(nameAnchor.attr('href'));
    if (!name || !productUrl) {
      console.warn('[startech] Skipping item: missing name/url', $el.find('.p-item-name').text().slice(0, 60));
      return null;
    }

    // --- External ID: derive from product URL slug (stable per product) ---
    const externalId = productUrl.split('/').filter(Boolean).pop();

    // --- Image ---
    const img = $el.find('.p-item-img img, img').first();
    let imageUrl = img.attr('data-src') || img.attr('src') || null;
    imageUrl = this.resolveUrl(imageUrl);

    // --- Prices ---
    // Star Tech shows either a single ".price-new" (with optional
    // strikethrough ".price-old"), or just a regular price span when
    // there's no discount.
    const priceNewText =
      $el.find('.p-item-price .price-new, .special-price, .price-new').first().text() ||
      $el.find('.p-item-price').first().text();
    const priceOldText = $el.find('.p-item-price .price-old, .old-price, .price-old').first().text();

    let currentPrice = BaseScraper.parsePrice(priceNewText);
    let originalPrice = BaseScraper.parsePrice(priceOldText);

    if (currentPrice == null) {
      console.warn(`[startech] Skipping "${name}": could not parse price from "${priceNewText}"`);
      return null;
    }
    // If "old" price equals/less than current, there's no real discount
    if (originalPrice != null && originalPrice <= currentPrice) {
      originalPrice = null;
    }

    // --- Stock status ---
    const stockText = $el.find('.p-item-stock, .stock-status, .label').first().text().trim().toLowerCase();
    const inStock = !/out of stock|stock out|unavailable/.test(stockText);

    // --- Offer end date ---
    // Star Tech sometimes shows a countdown like "Offer ends in: 2 Days"
    // on the product detail page rather than the listing card. We leave
    // offerEndsAt null at listing-scrape time; a detail-page scrape
    // (scrapeProductDetail) can populate it for products with discounts.
    const offerEndsAt = null;

    // --- Brand: try to infer from the first word of the name, refined
    // on the detail page where Star Tech lists "Brand: X" explicitly ---
    const brand = name.split(' ')[0] || null;

    return {
      externalId,
      name,
      brand,
      model: null, // refined during detail-page enrichment
      categorySlug,
      imageUrl,
      productUrl,
      currentPrice,
      originalPrice,
      offerEndsAt,
      inStock,
      specs: {},
    };
  }

  /**
   * Optional enrichment pass: visits a product's detail page to extract
   * full specs, brand, model, and (if present) a discount countdown end
   * date. Call sparingly (one request per product) — typically only for
   * products flagged with a discount, to keep total request volume sane.
   */
  async scrapeProductDetail(productUrl) {
    const html = await this.fetchHtml(productUrl);
    const $ = cheerio.load(html);

    const specs = {};
    $('.product-info-table tr, .specification-table tr').each((_, row) => {
      const $row = $(row);
      const key = $row.find('td').first().text().trim();
      const value = $row.find('td').last().text().trim();
      if (key && value && key !== value) specs[key] = value;
    });

    // Countdown text like "Offer Ends: 30 Jun 2026"
    let offerEndsAt = null;
    const offerText = $('.product-countdown, .offer-timer').first().attr('data-end') || '';
    if (offerText) {
      const parsed = new Date(offerText);
      if (!isNaN(parsed.getTime())) offerEndsAt = parsed.toISOString();
    }

    const brand = specs['Brand'] || null;
    const model = specs['Model'] || specs['Model No'] || specs['Model Number'] || null;

    return { specs, offerEndsAt, brand, model };
  }

  async scrapeAll() {
    const all = [];
    for (const categorySlug of Object.keys(CATEGORY_PATHS)) {
      console.log(`[startech] Scraping category: ${categorySlug}`);
      const items = await this.scrapeCategory(categorySlug);
      console.log(`[startech]   -> ${items.length} items`);
      all.push(...items);
      // Be polite: small delay between categories
      await new Promise((r) => setTimeout(r, 1000));
    }
    return all;
  }
}

module.exports = StartechScraper;
