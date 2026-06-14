// seed/data/ram.js
// specs: ramType, capacityGB, speedMHz, kit (modules count), perfScore (relative)

module.exports = [
  // ---- DDR4 ----
  { name: 'Corsair Vengeance LPX 8GB DDR4 3200MHz Single Stick', brand: 'Corsair', model: 'CMK8GX4M1A3200C16',
    basePrice: 2400, specs: { ramType: 'DDR4', capacityGB: 8, speedMHz: 3200, kit: 1, perfScore: 3200 } },
  { name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', brand: 'Corsair', model: 'CMK16GX4M2B3200C16',
    basePrice: 4600, specs: { ramType: 'DDR4', capacityGB: 16, speedMHz: 3200, kit: 2, perfScore: 3200 } },
  { name: 'G.SKILL Ripjaws V 16GB (2x8GB) DDR4 3600MHz', brand: 'G.SKILL', model: 'F4-3600C16D-16GVK',
    basePrice: 5200, specs: { ramType: 'DDR4', capacityGB: 16, speedMHz: 3600, kit: 2, perfScore: 3600 } },
  { name: 'Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz', brand: 'Kingston', model: 'KF432C16BBK2/16',
    basePrice: 4400, specs: { ramType: 'DDR4', capacityGB: 16, speedMHz: 3200, kit: 2, perfScore: 3200 } },
  { name: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz', brand: 'Corsair', model: 'CMK32GX4M2B3200C16',
    basePrice: 8800, specs: { ramType: 'DDR4', capacityGB: 32, speedMHz: 3200, kit: 2, perfScore: 3200 } },
  { name: 'G.SKILL Trident Z RGB 32GB (2x16GB) DDR4 3600MHz', brand: 'G.SKILL', model: 'F4-3600C16D-32GTZR',
    basePrice: 10500, specs: { ramType: 'DDR4', capacityGB: 32, speedMHz: 3600, kit: 2, perfScore: 3600 } },

  // ---- DDR5 ----
  { name: 'Corsair Vengeance 16GB (2x8GB) DDR5 5600MHz', brand: 'Corsair', model: 'CMK16GX5M2B5600C36',
    basePrice: 6800, specs: { ramType: 'DDR5', capacityGB: 16, speedMHz: 5600, kit: 2, perfScore: 5600 } },
  { name: 'Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz', brand: 'Corsair', model: 'CMK32GX5M2B6000C36',
    basePrice: 13500, specs: { ramType: 'DDR5', capacityGB: 32, speedMHz: 6000, kit: 2, perfScore: 6000 } },
  { name: 'G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz', brand: 'G.SKILL', model: 'F5-6000J3636F16GX2-TZ5RK',
    basePrice: 15800, specs: { ramType: 'DDR5', capacityGB: 32, speedMHz: 6000, kit: 2, perfScore: 6000 } },
  { name: 'Kingston FURY Beast 32GB (2x16GB) DDR5 5200MHz', brand: 'Kingston', model: 'KF552C40BBK2-32',
    basePrice: 12200, specs: { ramType: 'DDR5', capacityGB: 32, speedMHz: 5200, kit: 2, perfScore: 5200 } },
  { name: 'G.SKILL Trident Z5 RGB 64GB (2x32GB) DDR5 6000MHz', brand: 'G.SKILL', model: 'F5-6000J3636F32GX2-TZ5RK',
    basePrice: 29500, specs: { ramType: 'DDR5', capacityGB: 64, speedMHz: 6000, kit: 2, perfScore: 6000 } },
  { name: 'Corsair Vengeance 16GB (1x16GB) DDR5 5600MHz Single Stick', brand: 'Corsair', model: 'CMK16GX5M1B5600C36',
    basePrice: 6200, specs: { ramType: 'DDR5', capacityGB: 16, speedMHz: 5600, kit: 1, perfScore: 5600 } },
];
