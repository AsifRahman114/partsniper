// seed/data/cpu.js
// specs: socket, cores, threads, baseClockGHz, tdpWatts, perfScore, includesCooler

module.exports = [
  // ---- Intel 12th/13th/14th gen ----
  { name: 'Intel Core i3-12100F Processor', brand: 'Intel', model: 'i3-12100F',
    basePrice: 8200, specs: { socket: 'LGA1700', cores: 4, threads: 8, baseClockGHz: 3.3, tdpWatts: 58, perfScore: 14200, includesCooler: false } },
  { name: 'Intel Core i5-12400F Processor', brand: 'Intel', model: 'i5-12400F',
    basePrice: 13500, specs: { socket: 'LGA1700', cores: 6, threads: 12, baseClockGHz: 2.5, tdpWatts: 65, perfScore: 21500, includesCooler: false } },
  { name: 'Intel Core i5-13400F Processor', brand: 'Intel', model: 'i5-13400F',
    basePrice: 17800, specs: { socket: 'LGA1700', cores: 10, threads: 16, baseClockGHz: 2.5, tdpWatts: 65, perfScore: 26800, includesCooler: false } },
  { name: 'Intel Core i5-13600K Processor', brand: 'Intel', model: 'i5-13600K',
    basePrice: 31500, specs: { socket: 'LGA1700', cores: 14, threads: 20, baseClockGHz: 3.5, tdpWatts: 125, perfScore: 33800, includesCooler: false } },
  { name: 'Intel Core i7-13700K Processor', brand: 'Intel', model: 'i7-13700K',
    basePrice: 44500, specs: { socket: 'LGA1700', cores: 16, threads: 24, baseClockGHz: 3.4, tdpWatts: 125, perfScore: 41200, includesCooler: false } },
  { name: 'Intel Core i9-14900K Processor', brand: 'Intel', model: 'i9-14900K',
    basePrice: 62500, specs: { socket: 'LGA1700', cores: 24, threads: 32, baseClockGHz: 3.2, tdpWatts: 125, perfScore: 52800, includesCooler: false } },
  { name: 'Intel Core i7-14700K Processor', brand: 'Intel', model: 'i7-14700K',
    basePrice: 48800, specs: { socket: 'LGA1700', cores: 20, threads: 28, baseClockGHz: 3.4, tdpWatts: 125, perfScore: 46500, includesCooler: false } },

  // ---- AMD Ryzen 5000 (AM4) ----
  { name: 'AMD Ryzen 5 5600 Processor with Wraith Stealth Cooler', brand: 'AMD', model: 'Ryzen 5 5600',
    basePrice: 11500, specs: { socket: 'AM4', cores: 6, threads: 12, baseClockGHz: 3.5, tdpWatts: 65, perfScore: 20800, includesCooler: true } },
  { name: 'AMD Ryzen 5 5600X Processor', brand: 'AMD', model: 'Ryzen 5 5600X',
    basePrice: 14200, specs: { socket: 'AM4', cores: 6, threads: 12, baseClockGHz: 3.7, tdpWatts: 65, perfScore: 21600, includesCooler: true } },
  { name: 'AMD Ryzen 7 5700X Processor', brand: 'AMD', model: 'Ryzen 7 5700X',
    basePrice: 19500, specs: { socket: 'AM4', cores: 8, threads: 16, baseClockGHz: 3.4, tdpWatts: 65, perfScore: 28200, includesCooler: false } },
  { name: 'AMD Ryzen 7 5800X3D Processor', brand: 'AMD', model: 'Ryzen 7 5800X3D',
    basePrice: 28500, specs: { socket: 'AM4', cores: 8, threads: 16, baseClockGHz: 3.4, tdpWatts: 105, perfScore: 32500, includesCooler: false } },

  // ---- AMD Ryzen 7000 (AM5) ----
  { name: 'AMD Ryzen 5 7600 Processor', brand: 'AMD', model: 'Ryzen 5 7600',
    basePrice: 22500, specs: { socket: 'AM5', cores: 6, threads: 12, baseClockGHz: 3.8, tdpWatts: 65, perfScore: 27800, includesCooler: true } },
  { name: 'AMD Ryzen 5 7600X Processor', brand: 'AMD', model: 'Ryzen 5 7600X',
    basePrice: 25800, specs: { socket: 'AM5', cores: 6, threads: 12, baseClockGHz: 4.7, tdpWatts: 105, perfScore: 29200, includesCooler: false } },
  { name: 'AMD Ryzen 7 7700X Processor', brand: 'AMD', model: 'Ryzen 7 7700X',
    basePrice: 36500, specs: { socket: 'AM5', cores: 8, threads: 16, baseClockGHz: 4.5, tdpWatts: 105, perfScore: 38500, includesCooler: false } },
  { name: 'AMD Ryzen 7 7800X3D Processor', brand: 'AMD', model: 'Ryzen 7 7800X3D',
    basePrice: 48500, specs: { socket: 'AM5', cores: 8, threads: 16, baseClockGHz: 4.2, tdpWatts: 120, perfScore: 42500, includesCooler: false } },
  { name: 'AMD Ryzen 9 7900X Processor', brand: 'AMD', model: 'Ryzen 9 7900X',
    basePrice: 55500, specs: { socket: 'AM5', cores: 12, threads: 24, baseClockGHz: 4.7, tdpWatts: 170, perfScore: 53200, includesCooler: false } },
  { name: 'AMD Ryzen 9 7950X Processor', brand: 'AMD', model: 'Ryzen 9 7950X',
    basePrice: 72500, specs: { socket: 'AM5', cores: 16, threads: 32, baseClockGHz: 4.5, tdpWatts: 170, perfScore: 65200, includesCooler: false } },

  // ---- Budget ----
  { name: 'Intel Core i3-10100F Processor', brand: 'Intel', model: 'i3-10100F',
    basePrice: 6800, specs: { socket: 'LGA1200', cores: 4, threads: 8, baseClockGHz: 3.6, tdpWatts: 65, perfScore: 11800, includesCooler: false } },
  { name: 'AMD Ryzen 3 4100 Processor', brand: 'AMD', model: 'Ryzen 3 4100',
    basePrice: 7500, specs: { socket: 'AM4', cores: 4, threads: 8, baseClockGHz: 3.8, tdpWatts: 65, perfScore: 12500, includesCooler: true } },
];
