'use client';
// app/fundraisers/[slug]/page.tsx
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useFundraiser } from '@/hooks/useFundraisers';
import { useAuthStore } from '@/lib/store';
import DonateModal from '@/components/fundraiser/DonateModal';
import ShareButton from '@/components/fundraiser/ShareButton';
import { formatKES, calcProgress, getCategoryInfo, timeAgo } from '@/lib/utils';
import { BadgeCheck, Zap, Users, Eye, Heart, Clock, Send, Loader2 } from 'lucide-react';
import { Donation, Fundraiser } from '@/types';
import toast from 'react-hot-toast';

export default function FundraiserPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, token } = useAuthStore();
  const { fundraiser, loading, error, setFundraiser } = useFundraiser(slug);

  const [donateOpen, setDonateOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [updateMsg, setUpdateMsg] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex items-center justify-center gap-3" style={{ color: 'var(--color-muted)' }}>
      <Loader2 className="w-5 h-5 animate-spin" /> Loading fundraiser...
    </div>
  );

  if (error || !fundraiser) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="font-display text-2xl font-bold mb-2">Fundraiser not found</h2>
      <p style={{ color: 'var(--color-muted)' }}>This campaign may have been removed or the link is incorrect.</p>
    </div>
  );

  const f = fundraiser as Fundraiser & { donations: Donation[] };
  const progress = calcProgress(f.amountRaised, f.goalAmount);
  const catInfo = getCategoryInfo(f.category);
  const isOwner = user?._id === f.creatorId;

  const handleDonateSuccess = (amount: number) => {
    setDonateOpen(false);
    setFundraiser(prev => prev ? {
      ...prev,
      amountRaised: prev.amountRaised + amount,
      donorCount: prev.donorCount + 1,
    } : prev);
    toast.success(`Thank you! KES ${amount.toLocaleString()} donated 🙏`);
  };

  const handlePostUpdate = async () => {
    if (!updateMsg.trim()) return;
    setPostingUpdate(true);
    try {
      const res = await fetch(`/api/fundraisers/${f._id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: updateMsg }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setFundraiser(prev => prev ? { ...prev, updates: json.data } : prev);
      setUpdateMsg('');
      toast.success('Update posted!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setPostingUpdate(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* ── Left column ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Image gallery */}
          <div className="card overflow-hidden">
            <div className="relative h-72 sm:h-96 bg-gray-100">
              {f.images?.[activeImg] ? (
                <Image src={f.images[activeImg]} alt={f.title} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl"
                  style={{ background: 'linear-gradient(135deg, #fff8ef, #ffecd6)' }}>
                  {catInfo.label.split(' ')[0]}
                </div>
              )}
            </div>
            {f.images?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {f.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all"
                    style={{ borderColor: activeImg === i ? 'var(--color-brand)' : 'transparent' }}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge badge-category">{catInfo.label}</span>
              {f.urgent && <span className="badge badge-urgent"><Zap className="w-3 h-3" /> Urgent</span>}
              {f.verified && <span className="badge badge-verified"><BadgeCheck className="w-3 h-3" /> Verified</span>}
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">{f.title}</h1>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-muted)' }}>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(f.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {f.viewCount ?? 0} views</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {f.donorCount} donors</span>
            </div>
          </div>

          {/* Story */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg mb-3">The Story</h2>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text)' }}>
              {f.story}
            </div>
          </div>

          {/* Campaign updates */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg mb-4">
              Updates <span className="text-sm font-sans font-normal" style={{ color: 'var(--color-muted)' }}>({f.updates?.length ?? 0})</span>
            </h2>

            {isOwner && (
              <div className="flex gap-2 mb-5">
                <input className="input flex-1" placeholder="Post a campaign update..." value={updateMsg}
                  onChange={e => setUpdateMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePostUpdate()} />
                <button className="btn-primary px-4 py-2" onClick={handlePostUpdate} disabled={postingUpdate || !updateMsg.trim()}>
                  {postingUpdate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            )}

            {f.updates?.length > 0 ? (
              <div className="space-y-4">
                {[...f.updates].reverse().map((u, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--color-brand)' }} />
                    <div>
                      <p className="text-sm">{u.message}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{timeAgo(u.createdAt.toString())}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No updates yet.</p>
            )}
          </div>

          {/* Donors */}
          {f.donations?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Recent Donors</h2>
              <div className="space-y-3">
                {f.donations.slice(0, 10).map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: 'var(--color-brand)' }}>
                        {d.anonymous ? '?' : d.donorName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{d.anonymous ? 'Anonymous' : d.donorName}</p>
                        {d.message && <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{d.message}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-forest)' }}>{formatKES(d.amount)}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{timeAgo(d.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column (sticky sidebar) ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 card p-6 space-y-5">
            {/* Progress */}
            <div>
              <div className="flex items-end justify-between mb-1">
                <span className="font-display text-3xl font-bold">{formatKES(f.amountRaised)}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{progress}%</span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>raised of {formatKES(f.goalAmount)} goal</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                <span>{f.donorCount} donor{f.donorCount !== 1 ? 's' : ''}</span>
                {f.endDate && <span>Ends {timeAgo(f.endDate)}</span>}
              </div>
            </div>

            {/* Donate button */}
            {f.status === 'active' ? (
              <button className="btn-primary w-full text-base py-4" onClick={() => setDonateOpen(true)}>
                <Heart className="w-5 h-5" /> Donate via M-Pesa
              </button>
            ) : (
              <div className="text-center py-3 rounded-2xl text-sm font-semibold"
                style={{ background: '#f3f4f6', color: '#6b7280' }}>
                This fundraiser has ended
              </div>
            )}

            <ShareButton title={f.title} raised={f.amountRaised} goal={f.goalAmount} slug={f.slug} />

            {/* Creator info */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--color-muted)' }}>ORGANISED BY</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'var(--color-earth)' }}>
                  {f.creator?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1">
                    {f.creator?.name}
                    {f.creator?.verified && <BadgeCheck className="w-3.5 h-3.5 text-green-500" />}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Fundraiser organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {donateOpen && (
        <DonateModal
          fundraiserId={f._id}
          fundraiserTitle={f.title}
          onClose={() => setDonateOpen(false)}
          onSuccess={handleDonateSuccess}
        />
      )}
    </div>
  );
}
