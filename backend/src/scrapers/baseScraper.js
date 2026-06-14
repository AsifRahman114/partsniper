// scrapers/baseScraper.js
// ------------------------------------------------------------
// Common interface every shop scraper implements. Each scraper
// returns an array of "normalized product" objects matching the
// `products` table shape, so they can be passed straight to
// upsertProducts() in services/productService.js regardless of
// which shop they came from.
//
// Normalized product shape:
// {
//   externalId: string,        // shop's SKU / product id (for de-dup)
//   name: string,
//   brand: string | null,
//   model: string | null,
//   categorySlug: string,       // must match a row in `categories`
//   imageUrl: string | null,
//   productUrl: string,         // absolute URL to product page
//   currentPrice: number,       // BDT
//   originalPrice: number|null, // BDT, null if no discount
//   offerEndsAt: string|null,   // ISO date or null
//   inStock: boolean,
//   specs: object               // free-form key/value specs
// }
// ------------------------------------------------------------

const axios = require('axios');

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

class BaseScraper {
  constructor({ shopSlug, baseUrl }) {
    this.shopSlug = shopSlug;
    this.baseUrl = baseUrl;
  }

  async fetchHtml(url, { retries = 2, timeoutMs = 15000 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data } = await axios.get(url, {
          headers: DEFAULT_HEADERS,
          timeout: timeoutMs,
        });
        return data;
      } catch (err) {
        lastErr = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
      }
    }
    throw lastErr;
  }

  /**
   * Parses a price string like "৳ 12,500" or "Tk 12,500.00" -> 12500
   */
  static parsePrice(text) {
    if (!text) return null;
    const cleaned = String(text).replace(/[^\d.]/g, '');
    if (!cleaned) return null;
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  /**
   * Resolves a possibly-relative URL against the shop's base URL.
   */
  resolveUrl(maybeRelative) {
    if (!maybeRelative) return null;
    try {
      return new URL(maybeRelative, this.baseUrl).toString();
    } catch (_) {
      return maybeRelative;
    }
  }

  /**
   * Maps a shop's free-text category label to one of our canonical
   * category slugs (see categories table). Subclasses can override
   * for shop-specific naming.
   */
  static normalizeCategory(label) {
    const l = (label || '').toLowerCase();
    const map = [
      [/graphics? card|\bgpu\b|geforce|radeon/, 'gpu'],
      [/\bcpu\b|processor|ryzen|core i[3579]/, 'cpu'],
      [/motherboard|mainboard/, 'motherboard'],
      [/\bram\b|memory(?!.*card)/, 'ram'],
      [/\bssd\b|nvme/, 'ssd'],
      [/\bhdd\b|hard disk|hard drive/, 'hdd'],
      [/power supply|\bpsu\b/, 'psu'],
      [/casing|cabinet|chassis/, 'casing'],
      [/monitor/, 'monitor'],
      [/laptop|notebook/, 'laptop'],
      [/keyboard/, 'keyboard'],
      [/\bmouse\b/, 'mouse'],
      [/headphone|headset|earphone|earbud/, 'headphone'],
      [/cooler|cooling|fan(?!tasy)/, 'cooler'],
    ];
    for (const [re, slug] of map) {
      if (re.test(l)) return slug;
    }
    return null;
  }

  // Subclasses must implement:
  //   async scrapeCategory(categorySlug) -> Promise<NormalizedProduct[]>
  //   async scrapeAll() -> Promise<NormalizedProduct[]>
  async scrapeCategory(_categorySlug) {
    throw new Error('scrapeCategory() not implemented');
  }
  async scrapeAll() {
    throw new Error('scrapeAll() not implemented');
  }
}

module.exports = BaseScraper;
