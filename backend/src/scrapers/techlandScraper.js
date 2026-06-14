// scrapers/techlandScraper.js
// ------------------------------------------------------------
// Scraper for Techland BD (https://www.techlandbd.com)
//
// Techland's storefront (Magento-based) renders product listings
// as `.product-item` elements with:
//   .product-item-link        -> name + URL
//   .product-image-photo      -> image
//   [data-price-type="finalPrice"] .price   -> current price
//   [data-price-type="oldPrice"] .price     -> original price (if any)
//   .stock.unavailable                      -> out-of-stock flag
//
// As with all scrapers here, selectors are best-effort and
// defensive: missing fields are skipped with a warning rather
// than crashing the whole run.
// ------------------------------------------------------------

const cheerio = require('cheerio');
const BaseScraper = require('./baseScraper');

const CATEGORY_PATHS = {
  gpu: '/graphics-card.html',
  cpu: '/processor.html',
  motherboard: '/motherboard.html',
  ram: '/ram.html',
  ssd: '/ssd.html',
  hdd: '/hard-disk-drive.html',
  psu: '/power-supply.html',
  casing: '/casing.html',
  monitor: '/monitor.html',
  laptop: '/laptop.html',
  keyboard: '/keyboard.html',
  mouse: '/mouse.html',
  headphone: '/headphone.html',
  cooler: '/cpu-cooler.html',
};

const MAX_PAGES_PER_CATEGORY = 5;

class TechlandScraper extends BaseScraper {
  constructor() {
    super({ shopSlug: 'techland', baseUrl: 'https://www.techlandbd.com' });
  }

  async scrapeCategory(categorySlug) {
    const path = CATEGORY_PATHS[categorySlug];
    if (!path) {
      console.warn(`[techland] No category path mapped for "${categorySlug}", skipping.`);
      return [];
    }

    const products = [];
    for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
      const url = `${this.baseUrl}${path}${page > 1 ? `?p=${page}` : ''}`;
      let html;
      try {
        html = await this.fetchHtml(url);
      } catch (err) {
        console.error(`[techland] Failed to fetch ${url}: ${err.message}`);
        break;
      }

      const $ = cheerio.load(html);
      const items = $('.product-item, li.item.product');
      if (items.length === 0) break;

      items.each((_, el) => {
        const product = this._parseItem($, el, categorySlug);
        if (product) products.push(product);
      });

      const hasNext = $('.pages-item-next a, a.next').length > 0;
      if (!hasNext) break;
    }

    return products;
  }

  _parseItem($, el, categorySlug) {
    const $el = $(el);

    const nameAnchor = $el.find('.product-item-link, a.product-item-link').first();
    const name = nameAnchor.text().trim();
    const productUrl = this.resolveUrl(nameAnchor.attr('href'));
    if (!name || !productUrl) {
      console.warn('[techland] Skipping item: missing name/url');
      return null;
    }

    const externalId = productUrl.split('/').filter(Boolean).pop().replace('.html', '');

    const img = $el.find('.product-image-photo, img').first();
    let imageUrl = img.attr('data-src') || img.attr('src') || null;
    imageUrl = this.resolveUrl(imageUrl);

    // Magento price blocks
    const finalPriceText = $el.find('[data-price-type="finalPrice"] .price, .special-price .price').first().text();
    const oldPriceText = $el.find('[data-price-type="oldPrice"] .price, .old-price .price').first().text();
    const regularPriceText = $el.find('.price').first().text();

    let currentPrice = BaseScraper.parsePrice(finalPriceText) ?? BaseScraper.parsePrice(regularPriceText);
    let originalPrice = BaseScraper.parsePrice(oldPriceText);

    if (currentPrice == null) {
      console.warn(`[techland] Skipping "${name}": could not parse price`);
      return null;
    }
    if (originalPrice != null && originalPrice <= currentPrice) originalPrice = null;

    const stockText = $el.find('.stock').first().text().trim().toLowerCase();
    const inStock = !stockText.includes('unavailable') && !stockText.includes('out of stock');

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
    $('.additional-attributes-wrapper tr, .product-attribute-specs-table tr').each((_, row) => {
      const $row = $(row);
      const key = $row.find('th, .col.label').first().text().trim();
      const value = $row.find('td, .col.data').first().text().trim();
      if (key && value) specs[key] = value;
    });

    const brand = specs['Brand'] || specs['Manufacturer'] || null;
    const model = specs['Model'] || null;

    return { specs, offerEndsAt: null, brand, model };
  }

  async scrapeAll() {
    const all = [];
    for (const categorySlug of Object.keys(CATEGORY_PATHS)) {
      console.log(`[techland] Scraping category: ${categorySlug}`);
      const items = await this.scrapeCategory(categorySlug);
      console.log(`[techland]   -> ${items.length} items`);
      all.push(...items);
      await new Promise((r) => setTimeout(r, 1000));
    }
    return all;
  }
}

module.exports = TechlandScraper;
