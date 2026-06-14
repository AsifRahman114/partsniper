'use client';

import { AlertTriangle, AlertCircle, CheckCircle2, Zap, Gauge, Info } from 'lucide-react';
import { formatBDT } from '@/lib/format';

export default function CompatibilityPanel({ totalPrice, perfScore, budget, remainingBudget, compatibility, notes }) {
  const issues = compatibility?.issues || [];
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 sticky top-20">
      <h2 className="font-display font-semibold text-lg">Build Summary</h2>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted">Total Price</span>
          <span className="font-mono font-bold text-2xl">{formatBDT(totalPrice)}</span>
        </div>
        {budget != null && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Budget</span>
            <span className={`font-mono ${remainingBudget < 0 ? 'text-danger' : 'text-success'}`}>
              {remainingBudget < 0 ? `${formatBDT(Math.abs(remainingBudget))} over` : `${formatBDT(remainingBudget)} left`}
            </span>
          </div>
        )}
        {perfScore != null && (
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Performance Score</span>
            <span className="font-mono font-semibold text-lime">{perfScore.toLocaleString()}</span>
          </div>
        )}
        {compatibility?.estimatedWattage > 0 && (
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Est. Power Draw</span>
            <span className="font-mono">{compatibility.estimatedWattage} W</span>
          </div>
        )}
      </div>

      {/* Compatibility status */}
      <div className="pt-3 border-t border-border space-y-2">
        {errors.length === 0 && warnings.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="w-4 h-4" /> All parts compatible
          </div>
        )}
        {errors.map((issue, i) => (
          <div key={`err-${i}`} className="flex items-start gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{issue.message}</span>
          </div>
        ))}
        {warnings.map((issue, i) => (
          <div key={`warn-${i}`} className="flex items-start gap-2 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{issue.message}</span>
          </div>
        ))}
      </div>

      {/* Optimization notes */}
      {notes && notes.length > 0 && (
        <div className="pt-3 border-t border-border space-y-1.5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Optimizer notes
          </p>
          {notes.map((note, i) => (
            <p key={i} className="text-xs text-muted leading-relaxed">• {note}</p>
          ))}
        </div>
      )}
    </div>
  );
}
