// seed/data/gpu.js
// ------------------------------------------------------------
// Seed data shaped exactly like normalized scraper output
// (see scrapers/baseScraper.js). Prices in BDT reflect
// approximate Bangladesh retail market rates.
//
// `specs` fields used by the PC Builder compatibility/perf engine:
//   vram (GB), tdpWatts, perfScore (relative, higher=better),
//   length_mm (for case clearance checks - optional)
// ------------------------------------------------------------

module.exports = [
  // ---- RTX 4060 tier ----
  { name: 'ASUS DUAL RTX 4060 8GB GDDR6 OC Edition', brand: 'ASUS', model: 'DUAL-RTX4060-O8G',
    basePrice: 38500, specs: { chipset: 'RTX 4060', vram: 8, tdpWatts: 115, perfScore: 13200, length_mm: 242 } },
  { name: 'MSI GeForce RTX 4060 VENTUS 2X 8G OC', brand: 'MSI', model: 'RTX 4060 VENTUS 2X 8G OC',
    basePrice: 37800, specs: { chipset: 'RTX 4060', vram: 8, tdpWatts: 115, perfScore: 13100, length_mm: 220 } },
  { name: 'GIGABYTE GeForce RTX 4060 WINDFORCE OC 8G', brand: 'GIGABYTE', model: 'GV-N4060WF2OC-8GD',
    basePrice: 37200, specs: { chipset: 'RTX 4060', vram: 8, tdpWatts: 115, perfScore: 13050, length_mm: 230 } },

  // ---- RTX 4060 Ti tier ----
  { name: 'ASUS TUF Gaming RTX 4060 Ti 8GB OC Edition', brand: 'ASUS', model: 'TUF-RTX4060TI-O8G-GAMING',
    basePrice: 49500, specs: { chipset: 'RTX 4060 Ti', vram: 8, tdpWatts: 160, perfScore: 16800, length_mm: 300 } },
  { name: 'GIGABYTE GeForce RTX 4060 Ti EAGLE OC 8G', brand: 'GIGABYTE', model: 'GV-N406TEAGLE OC-8GD',
    basePrice: 48800, specs: { chipset: 'RTX 4060 Ti', vram: 8, tdpWatts: 160, perfScore: 16750, length_mm: 270 } },
  { name: 'MSI GeForce RTX 4060 Ti GAMING X 8G', brand: 'MSI', model: 'RTX 4060 Ti GAMING X 8G',
    basePrice: 51200, specs: { chipset: 'RTX 4060 Ti', vram: 8, tdpWatts: 160, perfScore: 16900, length_mm: 313 } },

  // ---- RTX 4070 tier ----
  { name: 'ASUS Dual GeForce RTX 4070 OC Edition 12GB', brand: 'ASUS', model: 'DUAL-RTX4070-O12G',
    basePrice: 68500, specs: { chipset: 'RTX 4070', vram: 12, tdpWatts: 200, perfScore: 21500, length_mm: 267 } },
  { name: 'GIGABYTE GeForce RTX 4070 GAMING OC 12G', brand: 'GIGABYTE', model: 'GV-N4070GAMING OC-12GD',
    basePrice: 67900, specs: { chipset: 'RTX 4070', vram: 12, tdpWatts: 200, perfScore: 21450, length_mm: 268 } },
  { name: 'MSI GeForce RTX 4070 VENTUS 3X 12G OC', brand: 'MSI', model: 'RTX 4070 VENTUS 3X 12G OC',
    basePrice: 69200, specs: { chipset: 'RTX 4070', vram: 12, tdpWatts: 200, perfScore: 21550, length_mm: 302 } },

  // ---- RTX 4070 Super ----
  { name: 'ASUS TUF Gaming GeForce RTX 4070 SUPER OC 12GB', brand: 'ASUS', model: 'TUF-RTX4070S-O12G-GAMING',
    basePrice: 79500, specs: { chipset: 'RTX 4070 Super', vram: 12, tdpWatts: 220, perfScore: 24800, length_mm: 348 } },
  { name: 'GIGABYTE GeForce RTX 4070 SUPER WINDFORCE OC 12G', brand: 'GIGABYTE', model: 'GV-N407SWF3OC-12GD',
    basePrice: 78200, specs: { chipset: 'RTX 4070 Super', vram: 12, tdpWatts: 220, perfScore: 24700, length_mm: 307 } },

  // ---- RTX 4080 / 4080 Super ----
  { name: 'ASUS ROG Strix GeForce RTX 4080 SUPER OC 16GB', brand: 'ASUS', model: 'ROG-STRIX-RTX4080S-O16G-GAMING',
    basePrice: 142000, specs: { chipset: 'RTX 4080 Super', vram: 16, tdpWatts: 320, perfScore: 34200, length_mm: 358 } },
  { name: 'GIGABYTE GeForce RTX 4080 SUPER GAMING OC 16G', brand: 'GIGABYTE', model: 'GV-N408SGAMING OC-16GD',
    basePrice: 138500, specs: { chipset: 'RTX 4080 Super', vram: 16, tdpWatts: 320, perfScore: 34000, length_mm: 336 } },

  // ---- RTX 4090 ----
  { name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB', brand: 'ASUS', model: 'ROG-STRIX-RTX4090-O24G-GAMING',
    basePrice: 218000, specs: { chipset: 'RTX 4090', vram: 24, tdpWatts: 450, perfScore: 48500, length_mm: 357 } },
  { name: 'GIGABYTE GeForce RTX 4090 GAMING OC 24G', brand: 'GIGABYTE', model: 'GV-N4090GAMING OC-24GD',
    basePrice: 212000, specs: { chipset: 'RTX 4090', vram: 24, tdpWatts: 450, perfScore: 48300, length_mm: 354 } },

  // ---- AMD RX 7600 ----
  { name: 'ASUS Dual Radeon RX 7600 OC Edition 8GB', brand: 'ASUS', model: 'DUAL-RX7600-O8G',
    basePrice: 33500, specs: { chipset: 'RX 7600', vram: 8, tdpWatts: 165, perfScore: 12800, length_mm: 251 } },
  { name: 'SAPPHIRE PULSE Radeon RX 7600 8GB', brand: 'SAPPHIRE', model: 'PULSE RX 7600',
    basePrice: 32800, specs: { chipset: 'RX 7600', vram: 8, tdpWatts: 165, perfScore: 12750, length_mm: 240 } },

  // ---- AMD RX 7700 XT ----
  { name: 'SAPPHIRE PULSE Radeon RX 7700 XT 12GB', brand: 'SAPPHIRE', model: 'PULSE RX 7700 XT',
    basePrice: 56500, specs: { chipset: 'RX 7700 XT', vram: 12, tdpWatts: 245, perfScore: 19800, length_mm: 285 } },
  { name: 'ASUS TUF Gaming Radeon RX 7700 XT OC 12GB', brand: 'ASUS', model: 'TUF-RX7700XT-O12G-GAMING',
    basePrice: 58200, specs: { chipset: 'RX 7700 XT', vram: 12, tdpWatts: 245, perfScore: 19900, length_mm: 320 } },

  // ---- AMD RX 7800 XT ----
  { name: 'SAPPHIRE NITRO+ Radeon RX 7800 XT 16GB', brand: 'SAPPHIRE', model: 'NITRO+ RX 7800 XT',
    basePrice: 71500, specs: { chipset: 'RX 7800 XT', vram: 16, tdpWatts: 263, perfScore: 23200, length_mm: 320 } },
  { name: 'XFX Speedster MERC319 Radeon RX 7800 XT 16GB', brand: 'XFX', model: 'MERC319 RX 7800 XT',
    basePrice: 70200, specs: { chipset: 'RX 7800 XT', vram: 16, tdpWatts: 263, perfScore: 23100, length_mm: 326 } },

  // ---- AMD RX 7900 XTX ----
  { name: 'SAPPHIRE NITRO+ Radeon RX 7900 XTX Vapor-X 24GB', brand: 'SAPPHIRE', model: 'NITRO+ VAPOR-X RX 7900 XTX',
    basePrice: 158000, specs: { chipset: 'RX 7900 XTX', vram: 24, tdpWatts: 355, perfScore: 38500, length_mm: 357 } },

  // ---- Budget tier: GTX 1650 / RX 6500 XT ----
  { name: 'GIGABYTE GeForce GTX 1650 OC LOW PROFILE 4G', brand: 'GIGABYTE', model: 'GV-N1650OC-4GL',
    basePrice: 16800, specs: { chipset: 'GTX 1650', vram: 4, tdpWatts: 75, perfScore: 6200, length_mm: 191 } },
  { name: 'ASUS Dual Radeon RX 6500 XT OC Edition 4GB', brand: 'ASUS', model: 'DUAL-RX6500XT-O4G',
    basePrice: 18500, specs: { chipset: 'RX 6500 XT', vram: 4, tdpWatts: 107, perfScore: 7100, length_mm: 192 } },
];
