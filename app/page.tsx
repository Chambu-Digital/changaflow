'use client';
// app/page.tsx
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Smartphone, TrendingUp, Heart, Users } from 'lucide-react';
import { useFundraisers } from '@/hooks/useFundraisers';
import FundraiserCard from '@/components/fundraiser/FundraiserCard';
import { useEffect, useState } from 'react';

interface PlatformStats {
  totalRaised: number;
  activeFundraisers: number;
  totalDonors: number;
}

function formatKES(amount: number): string {
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M+`;
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K+`;
  return `KES ${amount.toLocaleString()}`;
}

const HOW = [
  { icon: Heart, title: 'Create your fundraiser', desc: 'Tell your story and set a goal in under 2 minutes. No paperwork.' },
  { icon: Users, title: 'Share with your network', desc: 'One tap to share on WhatsApp, SMS, or any platform.' },
  { icon: Smartphone, title: 'Collect via M-Pesa', desc: 'Donors pay instantly with M-Pesa STK push. Money arrives directly.' },
];

const WHY = [
  { icon: Zap,       title: 'No approval delays',   desc: 'Start fundraising instantly. No waiting for document verification.' },
  { icon: Smartphone,title: 'M-Pesa first',          desc: 'Built for Kenya — M-Pesa STK push, not just card payments.' },
  { icon: Shield,    title: 'Trust without friction', desc: 'Optional verification badge, community reporting, fund updates.' },
  { icon: TrendingUp,title: 'Track in real-time',    desc: 'Live progress bar, donor list, and campaign analytics.' },
];

export default function HomePage() {
  const { fundraisers, loading } = useFundraisers({ sort: 'trending' });
  const featured = fundraisers.slice(0, 3);

  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-14 pb-20 px-4 md:pt-20 md:pb-28">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-72 h-72 md:w-[500px] md:h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #ff6b0a, transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 md:w-[400px] md:h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a07840, transparent 70%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold mb-5 leading-tight">
            Get Help{' '}
            <span style={{ color: 'var(--color-brand)' }}>When It Matters Most</span>
            <br className="hidden sm:block" /> in Kenya
          </h1>

          <p className="text-base md:text-xl mb-8 max-w-2xl mx-auto px-2" style={{ color: 'var(--color-muted)' }}>
            Start a fundraiser in under 2 minutes. Collect donations via M-Pesa instantly.
            No complex forms, no long approval times. Just FundMi.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link href="/create" className="btn-primary text-base px-6 py-4 w-full sm:w-auto">
              Start Your Fundraiser <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/browse" className="btn-secondary text-base px-6 py-4 w-full sm:w-auto">
              Browse Campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y py-8" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: stats ? formatKES(stats.totalRaised) : '—', label: 'Total raised' },
            { value: stats ? `${stats.activeFundraisers.toLocaleString()}+` : '—', label: 'Active fundraisers' },
            { value: stats ? `${stats.totalDonors.toLocaleString()}+` : '—', label: 'Donors' },
            { value: '< 2 min', label: 'To start fundraising' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--color-brand)' }}>
                {s.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trending fundraisers ── */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">Trending Now</h2>
            <p className="text-sm md:text-base" style={{ color: 'var(--color-muted)' }}>Help these campaigns reach their goal</p>
          </div>
          <Link href="/browse" className="btn-secondary text-sm py-2 px-3 md:px-4 flex-shrink-0">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-72 animate-pulse" style={{ background: '#f5efe6' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {featured.map((f, i) => (
              <FundraiserCard
                key={f._id}
                fundraiser={f}
                className="opacity-0-init animate-fade-up"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-2">How FundMi Works</h2>
            <p style={{ color: 'var(--color-muted)' }}>Three simple steps to start raising money</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW.map((item, i) => (
              <div key={i} className="text-center">
              
                <div className="text-4xl font-display font-bold mb-1 opacity-10">{i + 1}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/create" className="btn-primary text-base px-8 py-4">
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why FundMi ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-2">Why choose FundMi?</h2>
          <p style={{ color: 'var(--color-muted)' }}>Built for Kenya, unlike global platforms</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {WHY.map((item, i) => (
            <div key={i} className="card p-6 flex gap-4">
             
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-4 mb-20 rounded-3xl overflow-hidden">
        <div className="relative px-8 py-16 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #c04200 0%, #ff6b0a 50%, #ffb570 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-4">Ready to start your FundMi?</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of Kenyans raising money for what matters most.
            </p>
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all hover:-translate-y-1"
              style={{ background: 'white', color: 'var(--color-brand)' }}>
              Create Free Fundraiser <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
