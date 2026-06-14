'use client';

// Maps raw spec keys to human-readable labels with units.
const SPEC_LABELS = {
  chipset: 'Chipset', vram: 'VRAM', tdpWatts: 'TDP', perfScore: 'Performance Score', length_mm: 'Length',
  socket: 'Socket', cores: 'Cores', threads: 'Threads', baseClockGHz: 'Base Clock', includesCooler: 'Includes Cooler',
  formFactor: 'Form Factor', ramType: 'RAM Type', maxRamGB: 'Max RAM', ramSlots: 'RAM Slots', chipsetMobo: 'Chipset',
  capacityGB: 'Capacity', speedMHz: 'Speed', kit: 'Kit',
  interface: 'Interface', readSpeedMBps: 'Read Speed',
  rpm: 'RPM',
  wattage: 'Wattage', efficiency: 'Efficiency', modular: 'Modular',
  formFactorSupport: 'Supports', maxGpuLength_mm: 'Max GPU Length', includesFans: 'Included Fans',
  sizeInches: 'Screen Size', resolution: 'Resolution', refreshRateHz: 'Refresh Rate', panelType: 'Panel Type',
  cpu: 'CPU', gpu: 'GPU', ramGB: 'RAM', storageGB: 'Storage',
  type: 'Type', switchType: 'Switch Type', layout: 'Layout', wireless: 'Wireless',
  dpi: 'DPI', sensor: 'Sensor',
  mic: 'Microphone', surround: 'Surround Sound',
  sockets: 'Compatible Sockets', radiatorSize_mm: 'Radiator Size', tdpRatingWatts: 'TDP Rating',
};

const UNITS = {
  vram: 'GB', tdpWatts: 'W', length_mm: 'mm', baseClockGHz: 'GHz',
  maxRamGB: 'GB', capacityGB: 'GB', speedMHz: 'MHz',
  readSpeedMBps: 'MB/s', rpm: 'RPM', wattage: 'W',
  maxGpuLength_mm: 'mm', sizeInches: '"', refreshRateHz: 'Hz',
  ramGB: 'GB', storageGB: 'GB', dpi: 'DPI', radiatorSize_mm: 'mm', tdpRatingWatts: 'W',
};

function formatValue(key, value) {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  const unit = UNITS[key];
  return unit ? `${value} ${unit}` : String(value);
}

export default function SpecsTable({ specs }) {
  const entries = Object.entries(specs || {}).filter(([, v]) => v != null && v !== '');
  if (entries.length === 0) return <p className="text-sm text-muted">No detailed specifications available.</p>;

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between sm:justify-start sm:gap-3 text-sm py-1 border-b border-border/50 sm:border-none">
          <dt className="text-muted">{SPEC_LABELS[key] || key}</dt>
          <dd className="font-mono text-text sm:ml-auto">{formatValue(key, value)}</dd>
        </div>
      ))}
    </dl>
  );
}
