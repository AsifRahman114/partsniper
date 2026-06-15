'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crosshair, Search, Scale, Wrench, User, Menu, X, LogOut, Settings, SunMedium, MoonStar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="top-nav-shell sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Crosshair className="w-7 h-7 text-lime group-hover:rotate-45 transition-transform duration-300" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Part<span className="text-lime">Sniper</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" icon={<Search className="w-4 h-4" />} label="Dashboard" />
            <NavLink href="/compare" icon={<Scale className="w-4 h-4" />} label="Compare" />
            <NavLink href="/builder" icon={<Wrench className="w-4 h-4" />} label="PC Builder" />
          </nav>

          {/* Search bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parts, brands, models..."
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm
                           placeholder:text-muted focus:outline-none focus:border-lime/60 focus:ring-1 focus:ring-lime/30
                           transition-colors"
              />
            </div>
          </form>

          {/* Auth area */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted hover:border-lime/40 hover:text-text transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunMedium className="w-4 h-4 text-lime" /> : <MoonStar className="w-4 h-4 text-lime" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            {!loading && !user && (
              <>
                <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-muted hover:text-text transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-semibold bg-lime text-ink px-4 py-2 rounded-lg hover:bg-limeDark transition-colors">
                  Sign up
                </Link>
              </>
            )}
            {!loading && user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 text-sm font-medium hover:border-lime/40 transition-colors"
                >
                  <User className="w-4 h-4 text-lime" />
                  <span className="hidden sm:inline">{user.username}</span>
                  {!user.emailVerified && (
                    <span className="w-2 h-2 rounded-full bg-danger" title="Email not verified" />
                  )}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-surface2 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-muted" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-danger hover:bg-surface2 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 text-muted hover:text-text" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parts..."
                className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-lime/60"
              />
            </form>
            <div className="flex flex-col gap-1">
              <NavLink href="/" icon={<Search className="w-4 h-4" />} label="Dashboard" onClick={() => setMenuOpen(false)} />
              <NavLink href="/compare" icon={<Scale className="w-4 h-4" />} label="Compare" onClick={() => setMenuOpen(false)} />
              <NavLink href="/builder" icon={<Wrench className="w-4 h-4" />} label="PC Builder" onClick={() => setMenuOpen(false)} />
              {!user && (
                <NavLink href="/login" icon={<User className="w-4 h-4" />} label="Log in" onClick={() => setMenuOpen(false)} />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
