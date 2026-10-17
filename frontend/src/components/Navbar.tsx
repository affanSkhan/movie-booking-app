import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Clapperboard, Moon, Sun, Menu, X, LogOut, Shield, Ticket,
  ChevronDown, Sparkles, Film, Clock3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContextInstance';
import { useTheme } from '../contexts/ThemeContext';

const links = [
  { to: '/', label: 'Home', icon: Clapperboard },
  { to: '/movies', label: 'Movies', icon: Film },
  { to: '/showtimes', label: 'Showtimes', icon: Clock3 },
  { to: '/discover', label: 'AI Discover', icon: Sparkles },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };
  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };
  const linkClass = (path: string) => {
    const active = path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');
    return 'inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ' +
      (active
        ? 'bg-orange-500/10 text-orange-700 dark:bg-orange-300/10 dark:text-orange-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white');
  };
  const themeButton = 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/90 text-foreground shadow-sm backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-7 lg:px-10">
        <Link to="/" className="group inline-flex shrink-0 items-center gap-3" onClick={closeMenus} aria-label="MovieBook home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 to-orange-500 text-[#17110c] shadow-[0_5px_20px_rgba(249,115,22,0.20)] transition group-hover:scale-[1.04]">
            <Clapperboard className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span>
            <span className="block text-[15px] font-extrabold tracking-tight">MovieBook</span>
            <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:block">Your next movie night</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.to} to={link.to} className={linkClass(link.to)} onClick={closeMenus}>
                {link.to === '/discover' ? <Icon className="h-4 w-4" /> : null}
                {link.label}
              </Link>
            );
          })}
          {user && <Link to="/my-bookings" className={linkClass('/my-bookings')} onClick={closeMenus}>My bookings</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={linkClass('/admin')} onClick={closeMenus}><Shield className="h-4 w-4" /> Admin</Link>}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" onClick={toggleTheme} className={themeButton} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun className="h-4 w-4 text-orange-500" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <div className="relative">
              <button type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} aria-haspopup="menu"
                className="ml-1 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card pl-2 pr-3 transition hover:shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 text-xs font-bold text-[#17110c]">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                <span className="max-w-[8rem] truncate text-sm font-semibold">{user.name || 'Account'}</span>
                <ChevronDown className={'h-3.5 w-3.5 text-muted-foreground transition ' + (accountOpen ? 'rotate-180' : '')} />
              </button>
              {accountOpen && (
                <>
                  <button type="button" aria-label="Close account menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setAccountOpen(false)} />
                  <div role="menu" className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                    <div className="border-b border-border px-4 py-4">
                      <p className="truncate text-sm font-bold">{user.name || 'Your account'}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link role="menuitem" to="/my-bookings" onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"><Ticket className="h-4 w-4 text-primary" /> My bookings</Link>
                    <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"><LogOut className="h-4 w-4" /> Sign out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-1.5">
              <Link to="/login" onClick={closeMenus} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">Sign in</Link>
              <Link to="/register" onClick={closeMenus} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-105">Create account</Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={toggleTheme} className={themeButton} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <Sun className="h-4 w-4 text-orange-500" /> : <Moon className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen}
            aria-controls="moviebook-mobile-navigation" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} className={themeButton}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="moviebook-mobile-navigation" className="border-t border-border bg-background px-4 pb-5 pt-3 shadow-lg md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return <Link key={link.to} to={link.to} onClick={closeMenus} className={linkClass(link.to)}><Icon className="h-4 w-4" />{link.label}</Link>;
            })}
            {user && <Link to="/my-bookings" onClick={closeMenus} className={linkClass('/my-bookings')}><Ticket className="h-4 w-4" /> My bookings</Link>}
            {user?.role === 'admin' && <Link to="/admin" onClick={closeMenus} className={linkClass('/admin')}><Shield className="h-4 w-4" /> Admin</Link>}
          </div>
          {user ? (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="min-w-0"><p className="truncate text-sm font-bold">{user.name || 'Account'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p></div>
              <button type="button" onClick={handleLogout} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Link to="/login" onClick={closeMenus} className="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold">Sign in</Link>
              <Link to="/register" onClick={closeMenus} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">Create account</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
