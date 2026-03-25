'use client';
// components/ui/InstallPWA.tsx
import { Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface Props {
  variant?: 'button' | 'banner';
}

export default function InstallPWA({ variant = 'button' }: Props) {
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) return null;

  if (variant === 'banner') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
        style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-brand)' }}>
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Install ChangaFlow</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>Add to home screen for quick access</p>
          </div>
          <button onClick={install}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--color-brand)' }}>
            <Download className="w-3.5 h-3.5" /> Install
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={install}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
      style={{ background: 'var(--color-brand)', color: 'white' }}>
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
}
