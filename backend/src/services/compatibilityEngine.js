// services/compatibilityEngine.js
// ------------------------------------------------------------
// Checks compatibility between selected PC components and
// computes an aggregate performance score + estimated total
// system power draw.
//
// A "build" is represented as: { CPU: product, GPU: product,
// Motherboard: product, RAM: product, SSD: product, HDD: product,
// PSU: product, Casing: product, Cooler: product, Monitor: product }
// (any subset of keys; missing categories are simply not checked)
//
// Each product's `specs` field (parsed JSON) supplies the fields
// referenced below - see seed/data/*.js for the schema per category.
// ------------------------------------------------------------

const CATEGORY_KEYS = {
  cpu: 'CPU', gpu: 'GPU', motherboard: 'Motherboard', ram: 'RAM',
  ssd: 'SSD', hdd: 'HDD', psu: 'PSU', casing: 'Casing',
  cooler: 'Cooler', monitor: 'Monitor', laptop: 'Laptop',
};

/**
 * Runs all applicable compatibility checks for the given build.
 * Returns { issues: [{severity: 'error'|'warning', message, categories: []}],
 *           estimatedWattage, perfScore, totalPrice }
 */
function checkCompatibility(build) {
  const issues = [];
  const get = (cat) => build[cat] || null;
  const specsOf = (p) => p?.specs || {};

  const cpu = get('CPU');
  const gpu = get('GPU');
  const mobo = get('Motherboard');
  const ram = get('RAM');
  const psu = get('PSU');
  const casing = get('Casing');
  const cooler = get('Cooler');

  // ---- CPU <-> Motherboard socket ----
  if (cpu && mobo) {
    const cpuSocket = specsOf(cpu).socket;
    const moboSocket = specsOf(mobo).socket;
    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push({
        severity: 'error',
        message: `CPU socket (${cpuSocket}) does not match motherboard socket (${moboSocket})`,
        categories: ['CPU', 'Motherboard'],
      });
    }
  }

  // ---- RAM <-> Motherboard type ----
  if (ram && mobo) {
    const ramType = specsOf(ram).ramType;
    const moboRamType = specsOf(mobo).ramType;
    if (ramType && moboRamType && ramType !== moboRamType) {
      issues.push({
        severity: 'error',
        message: `RAM type (${ramType}) is not supported by this motherboard (requires ${moboRamType})`,
        categories: ['RAM', 'Motherboard'],
      });
    }
    const ramCapacity = specsOf(ram).capacityGB;
    const maxRam = specsOf(mobo).maxRamGB;
    if (ramCapacity && maxRam && ramCapacity > maxRam) {
      issues.push({
        severity: 'error',
        message: `RAM capacity (${ramCapacity}GB) exceeds motherboard maximum (${maxRam}GB)`,
        categories: ['RAM', 'Motherboard'],
      });
    }
  }

  // ---- Cooler <-> CPU socket ----
  if (cooler && cpu) {
    const cpuSocket = specsOf(cpu).socket;
    const coolerSockets = specsOf(cooler).sockets || [];
    if (cpuSocket && coolerSockets.length && !coolerSockets.includes(cpuSocket)) {
      issues.push({
        severity: 'error',
        message: `Cooler does not support CPU socket ${cpuSocket} (supports: ${coolerSockets.join(', ')})`,
        categories: ['Cooler', 'CPU'],
      });
    }
    // CPU TDP vs cooler rating
    const cpuTdp = specsOf(cpu).tdpWatts;
    const coolerTdp = specsOf(cooler).tdpRatingWatts;
    if (cpuTdp && coolerTdp && cpuTdp > coolerTdp) {
      issues.push({
        severity: 'warning',
        message: `Cooler's TDP rating (${coolerTdp}W) may be insufficient for this CPU's TDP (${cpuTdp}W)`,
        categories: ['Cooler', 'CPU'],
      });
    }
  } else if (cpu && !cooler) {
    const includesCooler = specsOf(cpu).includesCooler;
    if (!includesCooler) {
      issues.push({
        severity: 'warning',
        message: `This CPU does not include a stock cooler — add one to the build`,
        categories: ['CPU', 'Cooler'],
      });
    }
  }

  // ---- GPU <-> Casing length ----
  if (gpu && casing) {
    const gpuLength = specsOf(gpu).length_mm;
    const maxGpuLength = specsOf(casing).maxGpuLength_mm;
    if (gpuLength && maxGpuLength && gpuLength > maxGpuLength) {
      issues.push({
        severity: 'error',
        message: `GPU length (${gpuLength}mm) exceeds case clearance (${maxGpuLength}mm)`,
        categories: ['GPU', 'Casing'],
      });
    }
  }

  // ---- Motherboard <-> Casing form factor ----
  if (mobo && casing) {
    const moboFormFactor = specsOf(mobo).formFactor;
    const supported = specsOf(casing).formFactorSupport || [];
    if (moboFormFactor && supported.length && !supported.includes(moboFormFactor)) {
      issues.push({
        severity: 'error',
        message: `Motherboard form factor (${moboFormFactor}) is not supported by this case (supports: ${supported.join(', ')})`,
        categories: ['Motherboard', 'Casing'],
      });
    }
  }

  // ---- PSU wattage sufficiency ----
  // NOTE: estimateSystemWattage() sums sustained TDP figures (CPU + GPU +
  // baseline). Real PSU sizing must also account for *transient* power
  // spikes - modern GPUs (especially high-TDP RTX 40-series cards) can
  // momentarily draw 1.5-2x their rated TDP for milliseconds, which is
  // what actually trips underrated PSUs' protection circuits. A 30%
  // headroom (vs. a bare-minimum 20%) better reflects manufacturer
  // PSU-sizing guidance without building a full transient model.
  const estimatedWattage = estimateSystemWattage(build);
  const PSU_HEADROOM = 1.3;
  if (psu) {
    const psuWattage = specsOf(psu).wattage;
    if (psuWattage) {
      const recommendedMin = Math.ceil(estimatedWattage * PSU_HEADROOM);
      if (psuWattage < estimatedWattage) {
        issues.push({
          severity: 'error',
          message: `PSU wattage (${psuWattage}W) is insufficient for estimated system draw (~${estimatedWattage}W)`,
          categories: ['PSU'],
        });
      } else if (psuWattage < recommendedMin) {
        issues.push({
          severity: 'warning',
          message: `PSU wattage (${psuWattage}W) is below the recommended ${recommendedMin}W (30% headroom over ~${estimatedWattage}W estimated sustained draw, to cover transient power spikes from the GPU)`,
          categories: ['PSU'],
        });
      }
    }
  } else if (estimatedWattage > 0 && (cpu || gpu)) {
    issues.push({
      severity: 'warning',
      message: `No PSU selected — estimated system draw is ~${estimatedWattage}W; choose a PSU with at least ${Math.ceil(estimatedWattage * PSU_HEADROOM)}W`,
      categories: ['PSU'],
    });
  }


  return {
    issues,
    estimatedWattage,
    hasErrors: issues.some((i) => i.severity === 'error'),
  };
}

/**
 * Rough system power draw estimate: CPU TDP + GPU TDP + ~50W baseline
 * for motherboard/RAM/storage/fans.
 */
function estimateSystemWattage(build) {
  const cpuTdp = build.CPU?.specs?.tdpWatts || 0;
  const gpuTdp = build.GPU?.specs?.tdpWatts || 0;
  const baseline = 50;
  return cpuTdp + gpuTdp + baseline;
}

/**
 * Computes an aggregate "performance score" for the build.
 *
 * Weights reflect real-world impact for a gaming/value-oriented PC
 * (PartSniper's "minimum price, maximum performance" framing):
 *   - GPU (1.0): dominant factor for gaming performance at typical
 *     resolutions.
 *   - CPU (0.3): matters for avoiding bottlenecks, but a deliberately
 *     lower weight than GPU. This is calibrated against the seed
 *     data's perfScore ranges - CPU perfScore tops out around 65,200
 *     (e.g. Ryzen 9 7950X, a multi-core productivity benchmark) vs
 *     GPU perfScore topping out around 48,500 (RTX 4090). Without
 *     down-weighting, the optimizer would happily pair a high-end CPU
 *     with a budget GPU because the raw CPU number is larger - a
 *     GPU-bottlenecked configuration that's a poor real-world build
 *     for this product's audience. 0.3 keeps GPU upgrades preferable
 *     to CPU upgrades across the full range of both categories'
 *     perfScores (0.3 * 65,200 = 19,560 < 1.0 * 48,500), so the
 *     optimizer's leftover-budget passes correctly prioritize GPU.
 *   - RAM (0.5) / SSD (0.3): smaller, secondary contributions.
 *
 * This is a simple heuristic, not a true multi-benchmark aggregate.
 */
function computePerfScore(build) {
  let score = 0;
  if (build.GPU?.specs?.perfScore) score += build.GPU.specs.perfScore * 1.0;
  if (build.CPU?.specs?.perfScore) score += build.CPU.specs.perfScore * 0.3;
  if (build.RAM?.specs?.speedMHz) score += build.RAM.specs.speedMHz * 0.5;
  if (build.SSD?.specs?.readSpeedMBps) score += build.SSD.specs.readSpeedMBps * 0.3;
  return Math.round(score);
}

function computeTotalPrice(build) {
  return Object.values(build)
    .filter(Boolean)
    .reduce((sum, p) => sum + Number(p.currentPrice), 0);
}

module.exports = { checkCompatibility, computePerfScore, computeTotalPrice, estimateSystemWattage, CATEGORY_KEYS };
