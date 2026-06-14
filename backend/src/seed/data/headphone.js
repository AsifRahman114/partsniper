// seed/data/headphone.js
// specs: type (Over-ear/On-ear/In-ear), wireless, mic, surround

module.exports = [
  { name: 'A4Tech Bloody G300 Gaming Headset', brand: 'A4Tech', model: 'Bloody G300',
    basePrice: 1100, specs: { type: 'Over-ear', wireless: false, mic: true, surround: false } },
  { name: 'Fantech MH85 Captain Gaming Headset', brand: 'Fantech', model: 'MH85',
    basePrice: 1900, specs: { type: 'Over-ear', wireless: false, mic: true, surround: false } },
  { name: 'HyperX Cloud Stinger 2 Gaming Headset', brand: 'HyperX', model: 'Cloud Stinger 2',
    basePrice: 4500, specs: { type: 'Over-ear', wireless: false, mic: true, surround: true } },
  { name: 'Logitech G432 7.1 Surround Gaming Headset', brand: 'Logitech', model: 'G432',
    basePrice: 6200, specs: { type: 'Over-ear', wireless: false, mic: true, surround: true } },
  { name: 'Razer BlackShark V2 X Gaming Headset', brand: 'Razer', model: 'BlackShark V2 X',
    basePrice: 5800, specs: { type: 'Over-ear', wireless: false, mic: true, surround: true } },
  { name: 'HyperX Cloud II Wireless Gaming Headset', brand: 'HyperX', model: 'Cloud II Wireless',
    basePrice: 12500, specs: { type: 'Over-ear', wireless: true, mic: true, surround: true } },
  { name: 'JBL Tune 510BT Wireless On-Ear Headphones', brand: 'JBL', model: 'Tune 510BT',
    basePrice: 3800, specs: { type: 'On-ear', wireless: true, mic: true, surround: false } },
  { name: 'Sony WH-CH520 Wireless Headphones', brand: 'Sony', model: 'WH-CH520',
    basePrice: 5200, specs: { type: 'On-ear', wireless: true, mic: true, surround: false } },
];
