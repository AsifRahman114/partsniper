// seed/data/motherboard.js
// specs: socket, formFactor, ramType, maxRamGB, ramSlots, chipset

module.exports = [
  // ---- AM5 ----
  { name: 'ASUS TUF GAMING B650-PLUS WIFI Motherboard', brand: 'ASUS', model: 'TUF GAMING B650-PLUS WIFI',
    basePrice: 24500, specs: { socket: 'AM5', formFactor: 'ATX', ramType: 'DDR5', maxRamGB: 128, ramSlots: 4, chipset: 'B650' } },
  { name: 'MSI PRO B650M-A WIFI Motherboard', brand: 'MSI', model: 'PRO B650M-A WIFI',
    basePrice: 19800, specs: { socket: 'AM5', formFactor: 'mATX', ramType: 'DDR5', maxRamGB: 128, ramSlots: 4, chipset: 'B650' } },
  { name: 'GIGABYTE B650 GAMING X AX Motherboard', brand: 'GIGABYTE', model: 'B650 GAMING X AX',
    basePrice: 22500, specs: { socket: 'AM5', formFactor: 'ATX', ramType: 'DDR5', maxRamGB: 128, ramSlots: 4, chipset: 'B650' } },
  { name: 'ASUS ROG STRIX X670E-E GAMING WIFI Motherboard', brand: 'ASUS', model: 'ROG STRIX X670E-E GAMING WIFI',
    basePrice: 68500, specs: { socket: 'AM5', formFactor: 'ATX', ramType: 'DDR5', maxRamGB: 128, ramSlots: 4, chipset: 'X670E' } },
  { name: 'ASRock A620M-HDV Motherboard', brand: 'ASRock', model: 'A620M-HDV',
    basePrice: 12500, specs: { socket: 'AM5', formFactor: 'mATX', ramType: 'DDR5', maxRamGB: 96, ramSlots: 2, chipset: 'A620' } },

  // ---- AM4 ----
  { name: 'ASUS PRIME B550M-A Motherboard', brand: 'ASUS', model: 'PRIME B550M-A',
    basePrice: 12800, specs: { socket: 'AM4', formFactor: 'mATX', ramType: 'DDR4', maxRamGB: 128, ramSlots: 4, chipset: 'B550' } },
  { name: 'MSI B550 GAMING GEN3 Motherboard', brand: 'MSI', model: 'B550 GAMING GEN3',
    basePrice: 14500, specs: { socket: 'AM4', formFactor: 'ATX', ramType: 'DDR4', maxRamGB: 128, ramSlots: 4, chipset: 'B550' } },
  { name: 'GIGABYTE B450M DS3H Motherboard', brand: 'GIGABYTE', model: 'B450M DS3H',
    basePrice: 8500, specs: { socket: 'AM4', formFactor: 'mATX', ramType: 'DDR4', maxRamGB: 64, ramSlots: 4, chipset: 'B450' } },
  { name: 'ASUS TUF GAMING X570-PLUS WIFI Motherboard', brand: 'ASUS', model: 'TUF GAMING X570-PLUS WIFI',
    basePrice: 24800, specs: { socket: 'AM4', formFactor: 'ATX', ramType: 'DDR4', maxRamGB: 128, ramSlots: 4, chipset: 'X570' } },

  // ---- LGA1700 (Intel 12th/13th/14th) ----
  { name: 'ASUS PRIME B760M-A WIFI Motherboard', brand: 'ASUS', model: 'PRIME B760M-A WIFI',
    basePrice: 17500, specs: { socket: 'LGA1700', formFactor: 'mATX', ramType: 'DDR4', maxRamGB: 128, ramSlots: 4, chipset: 'B760' } },
  { name: 'MSI PRO B760-P DDR4 Motherboard', brand: 'MSI', model: 'PRO B760-P DDR4',
    basePrice: 16800, specs: { socket: 'LGA1700', formFactor: 'ATX', ramType: 'DDR4', maxRamGB: 128, ramSlots: 4, chipset: 'B760' } },
  { name: 'GIGABYTE B760M GAMING X DDR5 Motherboard', brand: 'GIGABYTE', model: 'B760M GAMING X DDR5',
    basePrice: 21500, specs: { socket: 'LGA1700', formFactor: 'mATX', ramType: 'DDR5', maxRamGB: 128, ramSlots: 4, chipset: 'B760' } },
  { name: 'ASUS ROG STRIX Z790-E GAMING WIFI Motherboard', brand: 'ASUS', model: 'ROG STRIX Z790-E GAMING WIFI',
    basePrice: 62500, specs: { socket: 'LGA1700', formFactor: 'ATX', ramType: 'DDR5', maxRamGB: 192, ramSlots: 4, chipset: 'Z790' } },
  { name: 'ASRock H610M-HDV/M.2 Motherboard', brand: 'ASRock', model: 'H610M-HDV/M.2',
    basePrice: 9800, specs: { socket: 'LGA1700', formFactor: 'mATX', ramType: 'DDR4', maxRamGB: 64, ramSlots: 2, chipset: 'H610' } },

  // ---- LGA1200 (Intel 10th/11th gen) ----
  { name: 'ASUS PRIME H510M-K Motherboard', brand: 'ASUS', model: 'PRIME H510M-K',
    basePrice: 8200, specs: { socket: 'LGA1200', formFactor: 'mATX', ramType: 'DDR4', maxRamGB: 64, ramSlots: 2, chipset: 'H510' } },
  { name: 'GIGABYTE B560M DS3H Motherboard', brand: 'GIGABYTE', model: 'B560M DS3H',
    basePrice: 11500, specs: { socket: 'LGA1200', formFactor: 'mATX', ramType: 'DDR4', maxRamGB: 128, ramSlots: 4, chipset: 'B560' } },
];
