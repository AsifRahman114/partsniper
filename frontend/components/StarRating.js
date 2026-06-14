'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Displays a star rating. If `interactive` is true, renders clickable
 * stars and calls onChange(rating) - used for shop rating submission.
 */
export default function StarRating({ value = 0, count, interactive = false, onChange, size = 14 }) {
  const [hover, setHover] = useState(0);
  const display = interactive && hover ? hover : value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={`${
              i <= Math.round(display) ? 'fill-lime text-lime' : 'fill-transparent text-muted'
            } ${interactive ? 'cursor-pointer transition-colors' : ''}`}
            onMouseEnter={interactive ? () => setHover(i) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            onClick={interactive ? () => onChange?.(i) : undefined}
          />
        ))}
      </div>
      {value != null && !interactive && (
        <span className="text-xs text-muted font-mono">
          {value > 0 ? value.toFixed(1) : '—'}
          {count != null && <span className="text-muted"> ({count})</span>}
        </span>
      )}
    </div>
  );
}
