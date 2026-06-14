'use client';

import { Check, X } from 'lucide-react';

const RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
  { test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p), label: 'One special character' },
];

export default function PasswordStrength({ password }) {
  if (!password) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1.5">
      {RULES.map((rule, i) => {
        const passed = rule.test(password);
        return (
          <div key={i} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-success' : 'text-muted'}`}>
            {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {rule.label}
          </div>
        );
      })}
    </div>
  );
}
