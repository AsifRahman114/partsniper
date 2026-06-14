// seed/data/cooler.js
// specs: type (Air/AIO), sockets (array), radiatorSize_mm (null for air), tdpRatingWatts

module.exports = [
  { name: 'Cooler Master Hyper 212 Black Edition Air Cooler', brand: 'Cooler Master', model: 'Hyper 212 Black Edition',
    basePrice: 3200, specs: { type: 'Air', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: null, tdpRatingWatts: 150 } },
  { name: 'DeepCool AK400 Air Cooler', brand: 'DeepCool', model: 'AK400',
    basePrice: 3600, specs: { type: 'Air', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: null, tdpRatingWatts: 220 } },
  { name: 'Thermalright Peerless Assassin 120 SE Air Cooler', brand: 'Thermalright', model: 'Peerless Assassin 120 SE',
    basePrice: 4200, specs: { type: 'Air', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: null, tdpRatingWatts: 245 } },
  { name: 'DeepCool LE520 240mm AIO Liquid Cooler', brand: 'DeepCool', model: 'LE520',
    basePrice: 7500, specs: { type: 'AIO', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: 240, tdpRatingWatts: 220 } },
  { name: 'Cooler Master MasterLiquid ML240L V2 AIO Cooler', brand: 'Cooler Master', model: 'ML240L V2',
    basePrice: 8200, specs: { type: 'AIO', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: 240, tdpRatingWatts: 230 } },
  { name: 'Corsair iCUE H100i ELITE 240mm AIO Cooler', brand: 'Corsair', model: 'H100i ELITE',
    basePrice: 14500, specs: { type: 'AIO', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: 240, tdpRatingWatts: 250 } },
  { name: 'NZXT Kraken X63 280mm AIO Cooler', brand: 'NZXT', model: 'Kraken X63',
    basePrice: 16800, specs: { type: 'AIO', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: 280, tdpRatingWatts: 280 } },
  { name: 'Corsair iCUE H150i ELITE 360mm AIO Cooler', brand: 'Corsair', model: 'H150i ELITE',
    basePrice: 19500, specs: { type: 'AIO', sockets: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], radiatorSize_mm: 360, tdpRatingWatts: 320 } },
];
