'use client';

export default function FormField({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full bg-surface border rounded-lg px-3 py-2.5 text-sm
                  placeholder:text-muted focus:outline-none focus:ring-1 transition-colors
                  ${props.error ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border focus:border-lime/60 focus:ring-lime/30'}
                  ${props.className || ''}`}
    />
  );
}
