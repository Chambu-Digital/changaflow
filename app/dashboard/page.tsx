'use client';
// app/dashboard/page.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Fundraiser } from '@/types';
import { formatKES, calcProgress, getCategoryInfo, timeAgo } from '@/lib/utils';
import {
  Plus, TrendingUp, Users, Heart, Loader2,
  MoreHorizontal, ExternalLink, PauseCircle, PlayCircle, Banknote,
  Clock, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  active:    { label: 'Active',             color: '#15803d', bg: '#dcfce7' },
  pending:   { label: 'Awaiting activation',color: '#d97706', bg: '#fef3c7' },
  paused:    { label: 'Paused',             color: '#6b7280', bg: '#f3f4f6' },
  completed: { label: 'Completed',          color: '#1d4ed8', bg: '#dbeafe' },
  removed:   { label: 'Removed',            color: '#dc2626', bg: '#fee2e2' },
} as const;

function CategoryBadge({ category, color }: { category: string; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold uppercase"
      style={{ background: `${color}20`, color }}
    >
      {category.slice(0, 3)}
    </div>
  );
}

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/dashboard'); return; }
    fetch('/api/user/fundraisers', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => { if (json.success) setFundraisers(json.data); })
      .finally(() => setLoading(false));
  }, [user, token, router]);

  const totalRaised = fundraisers.reduce((s, f) => s + f.amountRaised, 0);
  const totalDonors = fundraisers.reduce((s, f) => s + f.donorCount, 0);
  const active      = fundraisers.filter(f => f.status === 'active').length;

  const canWithdraw = (f: Fundraiser) => {
    if (f.status !== 'active') return false;
    const goalMet    = f.amountRaised >= f.goalAmount;
    const deadlineMet = f.endDate && new Date() >= new Date(f.endDate);
    return goalMet || !!deadlineMet;
  };

  const handleWithdraw = async (f: Fundraiser) => {
    const net = Math.floor(f.amountRaised * 0.975).toLocaleString();
    if (!confirm(`Withdraw KES ${net} (after 2.5% fee) to ${f.phoneNumber}?`)) return;
    try {
      const res  = await fetch(`/api/fundraisers/${f._id}/withdraw`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(json.message);
      setFundraisers(prev => prev.map(item =>
        item._id === f._id ? { ...item, status: 'completed' } : item
      ));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
    }
    setOpenMenu(null);
  };

  const toggleStatus = async (f: Fundraiser) => {
    const newStatus = f.status === 'active' ? 'paused' : 'active';
    try {
      const res  = await fetch(`/api/fundraisers/${f._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setFundraisers(prev => prev.map(item =>
        item._id === f._id ? { ...item, status: newStatus } : item
      ));
      toast.success(`Fundraiser ${newStatus === 'active' ? 'resumed' : 'paused'}`);
    } catch { toast.error('Failed to update'); }
    setOpenMenu(null);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex items-center justify-center gap-3"
      style={{ color: 'var(--color-muted)' }}>
      <Loader2 className="w-5 h-5 animate-spin" /> Loading dashboard...
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-0.5">
            Hey, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Manage your fundraisers</p>
        </div>
        <Link href="/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Fundraiser
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: TrendingUp, label: 'Total Raised',     value: formatKES(totalRaised), color: 'var(--color-forest)' },
          { icon: Users,      label: 'Total Donors',     value: totalDonors,            color: 'var(--color-brand)'  },
          { icon: Heart,      label: 'Active Campaigns', value: active,                 color: '#7c3aed'             },
        ].map((s, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3 mb-2">
             
             
              <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{s.label}</span>
            </div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Fundraisers ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold">Your Fundraisers</h2>
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{fundraisers.length} total</span>
      </div>

      {fundraisers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--color-surface)' }}>
            <Heart className="w-7 h-7" style={{ color: 'var(--color-muted)' }} />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No fundraisers yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            Create your first fundraiser and start collecting donations via M-Pesa.
          </p>
          <Link href="/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Start a Fundraiser
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {fundraisers.map(f => {
            const progress = calcProgress(f.amountRaised, f.goalAmount);
            const catInfo  = getCategoryInfo(f.category);
            const statusCfg = STATUS_CONFIG[f.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.paused;

            return (
              <div key={f._id} className="card p-5">
                <div className="flex items-start gap-3">

                  {/* Category badge */}
                  <CategoryBadge category={f.category} color={catInfo.color} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-snug truncate">{f.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            {timeAgo(f.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: statusCfg.bg, color: statusCfg.color }}>
                            {f.status === 'active'    && <CheckCircle2 className="w-3 h-3" />}
                            {f.status === 'pending'   && <Clock className="w-3 h-3" />}
                            {statusCfg.label}
                          </span>
                          {canWithdraw(f) && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ background: '#dcfce7', color: '#15803d' }}>
                              Ready to withdraw
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu */}
                      <div className="relative flex-shrink-0">
                        <button onClick={() => setOpenMenu(openMenu === f._id ? null : f._id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenu === f._id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-48 card py-1 z-50 shadow-lg">
                              <Link href={`/fundraisers/${f.slug}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => setOpenMenu(null)}>
                                <ExternalLink className="w-4 h-4" /> View Page
                              </Link>
                              {(f.status === 'active' || f.status === 'paused') && (
                                <button onClick={() => toggleStatus(f)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left">
                                  {f.status === 'active'
                                    ? <><PauseCircle className="w-4 h-4" /> Pause</>
                                    : <><PlayCircle  className="w-4 h-4" /> Resume</>}
                                </button>
                              )}
                              {canWithdraw(f) && (
                                <button onClick={() => handleWithdraw(f)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left font-medium"
                                  style={{ color: '#15803d' }}>
                                  <Banknote className="w-4 h-4" /> Withdraw Funds
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-2">
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, background: progress >= 100 ? '#15803d' : 'var(--color-brand)' }} />
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                        <span>
                          <strong style={{ color: 'var(--color-text)' }}>{formatKES(f.amountRaised)}</strong> raised
                        </span>
                        <span>{progress}% of {formatKES(f.goalAmount)} · {f.donorCount} donors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
