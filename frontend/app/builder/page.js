'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wrench, Sparkles, RotateCcw, Save, Loader2, Monitor as MonitorIcon, ChevronDown, BookMarked, Lock } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { BUILDER_CATEGORIES } from '@/lib/builder-categories';
import { formatBDT } from '@/lib/format';
import BuildSlot from '@/components/builder/BuildSlot';
import ComponentPicker from '@/components/builder/ComponentPicker';
import CompatibilityPanel from '@/components/builder/CompatibilityPanel';

const EMPTY_BUILD = Object.fromEntries(BUILDER_CATEGORIES.map((c) => [c.buildKey, null]));
const EMPTY_COMPAT = { issues: [], estimatedWattage: 0, hasErrors: false };

let debounceTimer = null;

function BuilderContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [budget, setBudget] = useState(100000);
  const [includeMonitor, setIncludeMonitor] = useState(true);
  const [build, setBuild] = useState(EMPTY_BUILD);
  const [locked, setLocked] = useState({}); // buildKey -> true
  const [summary, setSummary] = useState({ totalPrice: 0, perfScore: 0, compatibility: EMPTY_COMPAT });
  const [notes, setNotes] = useState([]);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState(null);
  const [pickerCategory, setPickerCategory] = useState(null); // slug of open picker
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  // ---- Load a saved build via ?load=<id> ----
  useEffect(() => {
    const loadId = searchParams.get('load');
    if (!loadId) return;
    api.get(`/builder/saved/${loadId}`).then((d) => {
      setBuild({ ...EMPTY_BUILD, ...d.build });
      setBudget(d.budget || 100000);
      setSummary({ totalPrice: d.totalPrice, perfScore: d.perfScore, compatibility: d.compatibility });
    }).catch(() => {});
  }, [searchParams]);

  // ---- Load user's saved builds list ----
  useEffect(() => {
    if (!user) { setSavedBuilds([]); return; }
    api.get('/builder/saved').then((d) => setSavedBuilds(d.builds)).catch(() => {});
  }, [user]);

  // ---- Recheck compatibility/perf/total whenever build changes (debounced) ----
  const recheck = useCallback((currentBuild) => {
    const ids = {};
    for (const [key, product] of Object.entries(currentBuild)) {
      if (product) ids[key] = product.id;
    }
    if (Object.keys(ids).length === 0) {
      setSummary({ totalPrice: 0, perfScore: 0, compatibility: EMPTY_COMPAT });
      return;
    }
    api.post('/builder/check', { build: ids })
      .then((d) => setSummary({ totalPrice: d.totalPrice, perfScore: d.perfScore, compatibility: d.compatibility }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => recheck(build), 300);
    return () => clearTimeout(debounceTimer);
  }, [build, recheck]);

  // ---- Handlers ----
  const handleOptimize = async () => {
    setOptimizing(true);
    setOptimizeError(null);
    setSaveStatus(null);
    try {
      const lockedIds = {};
      for (const [key, isLocked] of Object.entries(locked)) {
        if (isLocked && build[key]) lockedIds[key] = build[key].id;
      }
      const result = await api.post('/builder/optimize', { budget, includeMonitor, locked: lockedIds });
      setBuild({ ...EMPTY_BUILD, ...result.build });
      setSummary({ totalPrice: result.totalPrice, perfScore: result.perfScore, compatibility: result.compatibility });
      setNotes(result.notes || []);
    } catch (err) {
      if (err instanceof ApiError && err.details?.error) {
        setOptimizeError(err.details.error);
      } else {
        setOptimizeError(err.message);
      }
    } finally {
      setOptimizing(false);
    }
  };

  const handlePick = (product) => {
    setBuild((prev) => ({ ...prev, [pickerCategory.buildKey]: product }));
    setNotes([]);
    setPickerCategory(null);
  };

  const handleRemove = (buildKey) => {
    setBuild((prev) => ({ ...prev, [buildKey]: null }));
    setLocked((prev) => ({ ...prev, [buildKey]: false }));
    setNotes([]);
  };

  const handleToggleLock = (buildKey) => {
    setLocked((prev) => ({ ...prev, [buildKey]: !prev[buildKey] }));
  };

  const handleReset = () => {
    setBuild(EMPTY_BUILD);
    setLocked({});
    setNotes([]);
    setOptimizeError(null);
    setSaveStatus(null);
  };

  const handleSave = async () => {
    const ids = {};
    for (const [key, product] of Object.entries(build)) {
      if (product) ids[key] = product.id;
    }
    if (Object.keys(ids).length === 0) return;
    setSaveStatus('saving');
    try {
      await api.post('/builder/save', { name: `Build (${formatBDT(summary.totalPrice)})`, budget, build: ids });
      setSaveStatus('saved');
      if (user) {
        api.get('/builder/saved').then((d) => setSavedBuilds(d.builds)).catch(() => {});
      }
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (_) {
      setSaveStatus('error');
    }
  };

  const hasAnyParts = Object.values(build).some(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Wrench className="w-6 h-6 text-lime" /> PC Builder
        </h1>
        <p className="text-sm text-muted mt-1">
          Set a budget and let PartSniper assemble the best-value, fully-compatible build across all shops —
          or pick every part yourself.
        </p>
      </div>

      {/* Optimizer controls */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium mb-1.5">Budget (BDT)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono">৳</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              min={1000}
              step={1000}
              className="w-full bg-bg border border-border rounded-lg pl-8 pr-3 py-2.5 font-mono focus:outline-none focus:border-lime/50"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer pb-2.5">
          <input
            type="checkbox"
            checked={includeMonitor}
            onChange={(e) => setIncludeMonitor(e.target.checked)}
            className="w-4 h-4 accent-lime"
          />
          <MonitorIcon className="w-4 h-4 text-muted" />
          Include monitor
        </label>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="flex items-center gap-2 bg-lime text-bg font-semibold rounded-lg px-5 py-2.5 hover:bg-limeDark transition-colors disabled:opacity-60"
        >
          {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {hasAnyParts ? 'Re-optimize' : 'Auto-Build'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm text-muted hover:text-text hover:border-lime/30 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {optimizeError && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-3 text-sm">
          {optimizeError}
        </div>
      )}

      {hasAnyParts && (
        <p className="text-xs text-muted flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-lime shrink-0" />
          Click the lock icon on a part to keep it fixed when you re-optimize — useful if you already
          own that component or specifically want it included.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Build slots */}
        <div className="lg:col-span-2 space-y-2">
          {BUILDER_CATEGORIES.map((cat) => (
            <BuildSlot
              key={cat.buildKey}
              label={cat.label}
              product={build[cat.buildKey]}
              locked={!!locked[cat.buildKey]}
              required={cat.required}
              onPick={() => setPickerCategory(cat)}
              onRemove={() => handleRemove(cat.buildKey)}
              onToggleLock={() => handleToggleLock(cat.buildKey)}
            />
          ))}

          {/* Save build */}
          {hasAnyParts && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm font-medium hover:border-lime/40 transition-colors disabled:opacity-60"
              >
                {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Build
              </button>
              {saveStatus === 'saved' && <span className="text-sm text-success">Build saved!</span>}
              {saveStatus === 'error' && <span className="text-sm text-danger">Failed to save.</span>}
              {!user && saveStatus === 'saved' && (
                <span className="text-xs text-muted">Log in to view saved builds later.</span>
              )}
            </div>
          )}

          {/* Saved builds list */}
          {user && savedBuilds.length > 0 && (
            <SavedBuildsList builds={savedBuilds} />
          )}
        </div>

        {/* Summary */}
        <div>
          <CompatibilityPanel
            totalPrice={summary.totalPrice}
            perfScore={summary.perfScore}
            budget={budget}
            remainingBudget={budget - summary.totalPrice}
            compatibility={summary.compatibility}
            notes={notes}
          />
        </div>
      </div>

      {/* Picker modal */}
      {pickerCategory && (
        <ComponentPicker
          categorySlug={pickerCategory.slug}
          label={pickerCategory.label}
          onSelect={handlePick}
          onClose={() => setPickerCategory(null)}
        />
      )}
    </div>
  );
}

function SavedBuildsList({ builds }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-surface2 transition-colors rounded-xl"
      >
        <span className="flex items-center gap-2"><BookMarked className="w-4 h-4 text-lime" /> My Saved Builds ({builds.length})</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {builds.map((b) => (
            <a key={b.id} href={`/builder?load=${b.id}`} className="flex items-center justify-between p-3 text-sm hover:bg-surface2 transition-colors">
              <span>{b.name}</span>
              <span className="font-mono text-muted">{formatBDT(b.total_price)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-lime" /></div>}>
      <BuilderContent />
    </Suspense>
  );
}
