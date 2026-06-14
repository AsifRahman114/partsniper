// scrapers/ryansScraper.js
// ------------------------------------------------------------
// Scraper for Ryans Computers (https://www.ryans.com)
//
// Ryans' listing pages render products inside `.card.product-card`
// (or similar) elements:
//   .card-text .title / a.card-title  -> name + link
//   .product-img img                  -> image
//   .pr-text .new-pr / .price          -> current price
//   .pr-text .old-pr / del             -> original price (strikethrough)
//   .stock-status / badge "Out of Stock"
// ------------------------------------------------------------

const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

const CATEGORY_PATHS = {
  gpu: '/component/graphics-card',
  cpu: '/component/processor',
  motherboard: '/component/motherboard',
  ram: '/component/ram',
  ssd: '/component/internal-ssd',
  hdd: '/component/internal-hard-drive',
  psu: '/component/power-supply',
  casing: '/component/casing',
  monitor: '/monitor',
  laptop: '/laptop',
  keyboard: '/accessories/keyboard',
  mouse: '/accessories/mouse',
  headphone: '/accessories/headphone',
  cooler: '/component/cpu-cooler',
};

const MAX_PAGES_PER_CATEGORY = 5;

class RyansScraper extends BaseScraper {
  constructor() {
    super({ shopSlug: 'ryans', baseUrl: 'https://www.ryans.com' });
  }

  async scrapeCategory(categorySlug) {
    const path = CATEGORY_PATHS[categorySlug];
    if (!path) {
      console.warn(`[ryans] No category path mapped for "${categorySlug}", skipping.`);
      return [];
    }

    const products = [];
    for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
      const url = `${this.baseUrl}${path}?page=${page}`;
      let html;
      try {
        html = await this.fetchHtml(url);
      } catch (err) {
        console.error(`[ryans] Failed to fetch ${url}: ${err.message}`);
        break;
      }

      const $ = cheerio.load(html);
      const items = $('.card.product-card, .single-product-card');
      if (items.length === 0) break;

      items.each((_, el) => {
        const product = this._parseItem($, el, categorySlug);
        if (product) products.push(product);
      });

      const hasNext = $('a.page-link[rel="next"], .pagination .next:not(.disabled)').length > 0;
      if (!hasNext) break;
    }

    return products;
  }

  _parseItem($, el, categorySlug) {
    const $el = $(el);

    const nameAnchor = $el.find('a.card-title, .card-text a, h5 a').first();
    const name = nameAnchor.text().trim();
    const productUrl = this.resolveUrl(nameAnchor.attr('href'));
    if (!name || !productUrl) {
      console.warn('[ryans] Skipping item: missing name/url');
      return null;
    }

    const externalId = productUrl.split('/').filter(Boolean).pop();

    const img = $el.find('.product-img img, img').first();
    let imageUrl = img.attr('data-src') || img.attr('src') || null;
    imageUrl = this.resolveUrl(imageUrl);

    const newPriceText = $el.find('.new-pr, .pr-text .price, .current-price').first().text();
    const oldPriceText = $el.find('.old-pr, del, .old-price').first().text();

    let currentPrice = BaseScraper.parsePrice(newPriceText);
    let originalPrice = BaseScraper.parsePrice(oldPriceText);

    if (currentPrice == null) {
      console.warn(`[ryans] Skipping "${name}": could not parse price`);
      return null;
    }
    if (originalPrice != null && originalPrice <= currentPrice) originalPrice = null;

    const stockText = $el.find('.stock-status, .badge').first().text().trim().toLowerCase();
    const inStock = !stockText.includes('out of stock') && !stockText.includes('stock out');

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

  async scrapeProductDetail(productUrl) {
    const html = await this.fetchHtml(productUrl);
    const $ = cheerio.load(html);

    const specs = {};
    $('.specification-area tr, .product-specification tr').each((_, row) => {
      const $row = $(row);
      const key = $row.find('td').first().text().trim();
      const value = $row.find('td').last().text().trim();
      if (key && value && key !== value) specs[key] = value;
    });

    const brand = specs['Brand'] || null;
    const model = specs['Model'] || specs['Model Name'] || null;

    return { specs, offerEndsAt: null, brand, model };
  }

  async scrapeAll() {
    const all = [];
    for (const categorySlug of Object.keys(CATEGORY_PATHS)) {
      console.log(`[ryans] Scraping category: ${categorySlug}`);
      const items = await this.scrapeCategory(categorySlug);
      console.log(`[ryans]   -> ${items.length} items`);
      all.push(...items);
      await new Promise((r) => setTimeout(r, 1000));
    }
    return all;
  }
}

module.exports = RyansScraper;
