'use client';
// components/layout/Navbar.tsx
import Link from 'next/link';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Plus } from 'lucide-react';
import InstallPWA from '@/components/ui/InstallPWA';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{ background: 'rgba(253,250,246,0.95)', backdropFilter: 'blur(12px)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg md:text-xl flex-shrink-0"
          style={{ color: 'var(--color-brand)' }}>
          FundMi
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium flex-1 justify-center"
          style={{ color: 'var(--color-muted)' }}>
          <Link href="/browse" className="hover:text-orange-500 transition-colors">Browse</Link>
          <Link href="/create" className="hover:text-orange-500 transition-colors">Start a Fundraiser</Link>
          <Link href="/how-it-works" className="hover:text-orange-500 transition-colors">How it Works</Link>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <InstallPWA variant="button" />
          {user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-orange-50">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'var(--color-brand)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
              {dropOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 card py-2 z-50">
                    <Link href="/dashboard" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </Link>
                    <Link href="/create" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors">
                      <Plus className="w-4 h-4" /> New Fundraiser
                    </Link>
                    <hr className="my-1" style={{ borderColor: 'var(--color-border)' }} />
                    <button onClick={() => { clearAuth(); setDropOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
              <Link href="/create" className="btn-primary text-sm py-2 px-4">Start Fundraiser</Link>
            </>
          )}
        </div>

        {/* Mobile right: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link href="/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--color-brand)' }}>
              {user.name.charAt(0).toUpperCase()}
            </Link>
          )}
          <button className="p-2 rounded-lg hover:bg-orange-50 transition-colors" onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
          <Link href="/browse" className="flex items-center py-3 text-sm font-medium border-b"
            style={{ borderColor: 'var(--color-border)' }} onClick={() => setMenuOpen(false)}>
            Browse Fundraisers
          </Link>
          <Link href="/create" className="flex items-center py-3 text-sm font-medium border-b"
            style={{ borderColor: 'var(--color-border)' }} onClick={() => setMenuOpen(false)}>
            Start a Fundraiser
          </Link>
          <Link href="/how-it-works" className="flex items-center py-3 text-sm font-medium border-b"
            style={{ borderColor: 'var(--color-border)' }} onClick={() => setMenuOpen(false)}>
            How it Works
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 py-3 text-sm font-medium border-b"
                style={{ borderColor: 'var(--color-border)' }} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={() => { clearAuth(); setMenuOpen(false); }}
                className="flex items-center gap-2 py-3 text-sm font-medium text-red-500 text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-3">
              <Link href="/auth/login" className="btn-secondary flex-1 text-sm py-2.5" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/create" className="btn-primary flex-1 text-sm py-2.5" onClick={() => setMenuOpen(false)}>Start Fundraiser</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
