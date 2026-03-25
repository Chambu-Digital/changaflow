'use client';
// app/auth/register/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email || undefined, password: form.password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setAuth(json.user, json.token);
      toast.success(`Welcome to FundMi, ${json.user.name.split(' ')[0]}! 🎉`);
      router.push(searchParams.get('redirect') || '/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl mb-4" style={{ color: 'var(--color-brand)' }}>
            FundMi
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
          <p style={{ color: 'var(--color-muted)' }}>Start fundraising in under 2 minutes</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="John Kamau" required autoFocus />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="0712 345 678" required />
            </div>
            <div>
              <label className="label">Email <span className="font-normal" style={{ color: 'var(--color-muted)' }}>(optional)</span></label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="john@gmail.com" />
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters" required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <input className="input" type="password" value={form.confirm}
                onChange={e => set('confirm', e.target.value)} placeholder="Re-enter password" required autoComplete="new-password" />
            </div>

            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              By creating an account you agree to our{' '}
              <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>

            <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account '}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link href={`/auth/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              className="font-semibold" style={{ color: 'var(--color-brand)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
