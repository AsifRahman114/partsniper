'use client';

import { ArrowUpDown, Tag, PackageCheck } from 'lucide-react';

const SORT_OPTIONS = [
  { value: '', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount_desc', label: 'Biggest Discount' },
  { value: 'rating_desc', label: 'Shop Rating' },
];

export default function FilterBar({ sort, onSortChange, discountsOnly, onDiscountsToggle, inStockOnly, onInStockToggle, resultCount }) {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-between">
      <div className="text-sm text-muted">
        {resultCount != null && (
          <span><span className="text-text font-semibold font-mono">{resultCount}</span> results</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <ToggleChip
          active={discountsOnly}
          onClick={onDiscountsToggle}
          icon={<Tag className="w-3.5 h-3.5" />}
          label="Discounts only"
        />
        <ToggleChip
          active={inStockOnly}
          onClick={onInStockToggle}
          icon={<PackageCheck className="w-3.5 h-3.5" />}
          label="In stock only"
        />
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-surface border border-border rounded-lg pl-8 pr-8 py-1.5 text-sm
                       focus:outline-none focus:border-lime/50 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function ToggleChip({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
        ${active
          ? 'bg-success/10 text-success border-success/40'
          : 'bg-surface text-muted border-border hover:text-text hover:border-border'}`}
    >
      {icon}
      {label}
    </button>
  );
}
