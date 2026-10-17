import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Clapperboard,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  Shield,
  Ticket,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContextInstance';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
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

  const links = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/showtimes', label: 'Showtimes' },
  ];

  const linkClass = (path: string) => {
    const active = path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');
    return 'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
      (active ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white');
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#0a0b10]/90 text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-10">
        <Link to="/" className="group inline-flex shrink-0 items-center gap-3" onClick={closeMenus} aria-label="MovieBook home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 to-orange-500 text-[#17110c] shadow-[0_5px_20px_rgba(249,115,22,0.17)] transition group-hover:scale-[1.03]">
            <Clapperboard className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span>
            <span className="block text-[15px] font-bold tracking-[0.015em] text-white">MovieBook</span>
            <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.2em] text-white/40 sm:block">Your next movie night</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass(link.to)} onClick={closeMenus}>
              {link.label}
              {link.to === location.pathname && <span className="absolute inset-x-3 -bottom-[1.05rem] h-0.5 rounded-full bg-orange-300" />}
            </Link>
          ))}
          {user && (
            <Link to="/my-bookings" className={linkClass('/my-bookings')} onClick={closeMenus}>
              My bookings
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={linkClass('/admin')} onClick={closeMenus}>
              <span className="inline-flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-orange-300" /> Admin</span>
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/65 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-orange-200" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="ml-1 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] pl-2 pr-3 transition hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 text-xs font-bold text-[#17110c]">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="max-w-[8rem] truncate text-sm font-medium text-white/85">{user.name || 'Account'}</span>
                <ChevronDown className={'h-3.5 w-3.5 text-white/50 transition ' + (accountOpen ? 'rotate-180' : '')} />
              </button>

              {accountOpen && (
                <>
                  <button type="button" aria-label="Close account menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setAccountOpen(false)} />
                  <div role="menu" className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#15161e] shadow-2xl">
                    <div className="border-b border-white/[0.08] px-4 py-4">
                      <p className="truncate text-sm font-semibold text-white">{user.name || 'Your account'}</p>
                      <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
                    </div>
                    <Link role="menuitem" to="/my-bookings" onClick={closeMenus} className="flex items-center gap-3 px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.05] hover:text-white">
                      <Ticket className="h-4 w-4 text-orange-200" /> My bookings
                    </Link>
                    <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-white/[0.07] px-4 py-3 text-left text-sm text-rose-300 transition hover:bg-rose-400/[0.08]">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login" onClick={closeMenus} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white">Sign in</Link>
              <Link to="/register" onClick={closeMenus} className="rounded-xl bg-orange-400 px-4 py-2.5 text-sm font-bold text-[#17110c] transition hover:bg-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200">Create account</Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.09]"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-orange-200" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="moviebook-mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.09]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="moviebook-mobile-navigation" className="border-t border-white/[0.08] bg-[#0a0b10] px-4 pb-5 pt-3 md:hidden">
          <div className="space-y-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={closeMenus} className={'block ' + linkClass(link.to)}>
                {link.label}
              </Link>
            ))}
            {user && <Link to="/my-bookings" onClick={closeMenus} className={'block ' + linkClass('/my-bookings')}>My bookings</Link>}
            {user?.role === 'admin' && <Link to="/admin" onClick={closeMenus} className={'block ' + linkClass('/admin')}>Admin panel</Link>}
          </div>
          {user ? (
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
              <div className="min-w-0 pr-3">
                <p className="truncate text-sm font-semibold text-white">{user.name || 'Account'}</p>
                <p className="mt-1 truncate text-xs text-white/45">{user.email}</p>
              </div>
              <button type="button" onClick={handleLogout} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.07] px-3 py-2 text-xs font-semibold text-rose-200">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4">
              <Link to="/login" onClick={closeMenus} className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:bg-white/[0.05]">Sign in</Link>
              <Link to="/register" onClick={closeMenus} className="rounded-xl bg-orange-400 px-4 py-3 text-center text-sm font-bold text-[#17110c] transition hover:bg-orange-300">Create account</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;