// seed/data/hdd.js
// specs: capacityGB, rpm, formFactor

module.exports = [
  { name: 'WD Blue 1TB 7200RPM SATA HDD', brand: 'WD', model: 'WD10EZEX',
    basePrice: 4200, specs: { capacityGB: 1000, rpm: 7200, formFactor: '3.5"' } },
  { name: 'Seagate Barracuda 1TB 7200RPM SATA HDD', brand: 'Seagate', model: 'ST1000DM010',
    basePrice: 4000, specs: { capacityGB: 1000, rpm: 7200, formFactor: '3.5"' } },
  { name: 'WD Blue 2TB 7200RPM SATA HDD', brand: 'WD', model: 'WD20EZBX',
    basePrice: 6800, specs: { capacityGB: 2000, rpm: 7200, formFactor: '3.5"' } },
  { name: 'Seagate Barracuda 2TB 7200RPM SATA HDD', brand: 'Seagate', model: 'ST2000DM008',
    basePrice: 6600, specs: { capacityGB: 2000, rpm: 7200, formFactor: '3.5"' } },
  { name: 'WD Purple 4TB Surveillance HDD', brand: 'WD', model: 'WD43PURZ',
    basePrice: 12500, specs: { capacityGB: 4000, rpm: 5400, formFactor: '3.5"' } },
  { name: 'Seagate IronWolf 4TB NAS HDD', brand: 'Seagate', model: 'ST4000VN006',
    basePrice: 13800, specs: { capacityGB: 4000, rpm: 5400, formFactor: '3.5"' } },
  { name: 'Toshiba P300 1TB 7200RPM SATA HDD', brand: 'Toshiba', model: 'HDWD110',
    basePrice: 3900, specs: { capacityGB: 1000, rpm: 7200, formFactor: '3.5"' } },
];
