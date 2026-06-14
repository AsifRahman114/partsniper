// seed/data/ssd.js
// specs: interface (SATA / NVMe PCIe3 / NVMe PCIe4 / NVMe PCIe5), capacityGB, readSpeedMBps, perfScore

module.exports = [
  // ---- SATA ----
  { name: 'WD Green 240GB SATA III SSD', brand: 'WD', model: 'WD Green 240GB',
    basePrice: 2100, specs: { interface: 'SATA', capacityGB: 240, readSpeedMBps: 545, perfScore: 545 } },
  { name: 'Samsung 870 EVO 500GB SATA III SSD', brand: 'Samsung', model: '870 EVO 500GB',
    basePrice: 4800, specs: { interface: 'SATA', capacityGB: 500, readSpeedMBps: 560, perfScore: 560 } },
  { name: 'Crucial MX500 1TB SATA III SSD', brand: 'Crucial', model: 'MX500 1TB',
    basePrice: 8200, specs: { interface: 'SATA', capacityGB: 1000, readSpeedMBps: 560, perfScore: 560 } },
  { name: 'Kingston A400 480GB SATA III SSD', brand: 'Kingston', model: 'A400 480GB',
    basePrice: 3600, specs: { interface: 'SATA', capacityGB: 480, readSpeedMBps: 500, perfScore: 500 } },

  // ---- NVMe PCIe 3.0 ----
  { name: 'WD Blue SN570 500GB NVMe PCIe Gen3 SSD', brand: 'WD', model: 'SN570 500GB',
    basePrice: 4500, specs: { interface: 'NVMe PCIe3', capacityGB: 500, readSpeedMBps: 3500, perfScore: 3500 } },
  { name: 'WD Blue SN570 1TB NVMe PCIe Gen3 SSD', brand: 'WD', model: 'SN570 1TB',
    basePrice: 8200, specs: { interface: 'NVMe PCIe3', capacityGB: 1000, readSpeedMBps: 3500, perfScore: 3500 } },
  { name: 'Samsung 980 1TB NVMe PCIe Gen3 SSD', brand: 'Samsung', model: '980 1TB',
    basePrice: 9200, specs: { interface: 'NVMe PCIe3', capacityGB: 1000, readSpeedMBps: 3500, perfScore: 3500 } },
  { name: 'Crucial P3 500GB NVMe PCIe Gen3 SSD', brand: 'Crucial', model: 'P3 500GB',
    basePrice: 4200, specs: { interface: 'NVMe PCIe3', capacityGB: 500, readSpeedMBps: 3500, perfScore: 3500 } },

  // ---- NVMe PCIe 4.0 ----
  { name: 'Samsung 980 PRO 1TB NVMe PCIe Gen4 SSD', brand: 'Samsung', model: '980 PRO 1TB',
    basePrice: 12500, specs: { interface: 'NVMe PCIe4', capacityGB: 1000, readSpeedMBps: 7000, perfScore: 7000 } },
  { name: 'WD Black SN850X 1TB NVMe PCIe Gen4 SSD', brand: 'WD', model: 'SN850X 1TB',
    basePrice: 13200, specs: { interface: 'NVMe PCIe4', capacityGB: 1000, readSpeedMBps: 7300, perfScore: 7300 } },
  { name: 'Crucial T500 1TB NVMe PCIe Gen4 SSD', brand: 'Crucial', model: 'T500 1TB',
    basePrice: 11800, specs: { interface: 'NVMe PCIe4', capacityGB: 1000, readSpeedMBps: 7400, perfScore: 7400 } },
  { name: 'Samsung 990 PRO 2TB NVMe PCIe Gen4 SSD', brand: 'Samsung', model: '990 PRO 2TB',
    basePrice: 22500, specs: { interface: 'NVMe PCIe4', capacityGB: 2000, readSpeedMBps: 7450, perfScore: 7450 } },
  { name: 'WD Black SN770 500GB NVMe PCIe Gen4 SSD', brand: 'WD', model: 'SN770 500GB',
    basePrice: 6200, specs: { interface: 'NVMe PCIe4', capacityGB: 500, readSpeedMBps: 5150, perfScore: 5150 } },

  // ---- NVMe PCIe 5.0 ----
  { name: 'Crucial T705 1TB NVMe PCIe Gen5 SSD', brand: 'Crucial', model: 'T705 1TB',
    basePrice: 19500, specs: { interface: 'NVMe PCIe5', capacityGB: 1000, readSpeedMBps: 14500, perfScore: 14500 } },
];
