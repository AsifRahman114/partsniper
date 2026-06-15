'use client';

import {
  Cpu, CircuitBoard, MemoryStick, HardDrive, Plug, Box, Monitor,
  Laptop, Keyboard, Mouse, Headphones, Fan, Database, LayoutGrid,
} from 'lucide-react';

const ICONS = {
  cpu: Cpu,
  'circuit-board': CircuitBoard,
  'memory-stick': MemoryStick,
  'hard-drive': HardDrive,
  database: Database,
  plug: Plug,
  box: Box,
  monitor: Monitor,
  laptop: Laptop,
  keyboard: Keyboard,
  mouse: Mouse,
  headphones: Headphones,
  fan: Fan,
  chip: Cpu,
};

export default function CategoryNav({ categories, active, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <CategoryPill
        label="All"
        Icon={LayoutGrid}
        active={!active}
        onClick={() => onSelect(null)}
      />
      {categories.map((cat) => {
        const Icon = ICONS[cat.icon] || Box;
        return (
          <CategoryPill
            key={cat.slug}
            label={cat.name}
            Icon={Icon}
            active={active === cat.slug}
            onClick={() => onSelect(cat.slug)}
          />
        );
      })}
    </div>
  );
}

function CategoryPill({ label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
        ${active
          ? 'bg-lime text-ink border-lime'
          : 'bg-surface text-muted border-border hover:border-lime/40 hover:text-text'}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
