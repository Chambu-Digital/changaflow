'use client';
// app/create/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/utils';
import { Loader2, Upload, CheckCircle2, X, Smartphone, Building2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;

interface FormData {
  title: string;
  description: string;
  story: string;
  goalAmount: string;
  category: string;
  phoneNumber: string;
  paybillNumber: string;
  images: string[];
  urgent: boolean;
  endDate: string;
}

const EMPTY: FormData = {
  title: '', description: '', story: '', goalAmount: '',
  category: '', phoneNumber: '', paybillNumber: '',
  images: [], urgent: false, endDate: '',
};

const ACTIVATION_FEE = 50;

export default function CreatePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  // After fundraiser is created, we hold its ID to trigger activation
  const [fundraiserId, setFundraiserId] = useState<string | null>(null);
  const [activationSent, setActivationSent] = useState(false);
  const [payMethod, setPayMethod] = useState<'stk' | 'paybill'>('stk');

  const set = (key: keyof FormData, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4"></div>
        <h2 className="font-display text-2xl font-bold mb-2">Sign in to continue</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
          You need an account to create a fundraiser.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login?redirect=/create" className="btn-secondary">Sign In</Link>
          <Link href="/auth/register?redirect=/create" className="btn-primary">Create Account</Link>
        </div>
      </div>
    );
  }

  const canNext = () => {
    if (step === 1) return form.title.length >= 10 && form.description.length >= 20 && form.category;
    if (step === 2) return form.story.length >= 50 && Number(form.goalAmount) >= 100;
    return true;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      set('images', [...form.images, reader.result as string]);
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Step 2 → 3: create the fundraiser (pending) then move to activation step
  const handleCreateFundraiser = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fundraisers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, goalAmount: Number(form.goalAmount) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setFundraiserId(json.data._id);
      setStep(3);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save fundraiser');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: send KES 50 STK push to activate
  const handleActivate = async () => {
    if (!fundraiserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fundraisers/${fundraiserId}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setActivationSent(true);
      toast.success('M-Pesa prompt sent! Check your phone.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Progress steps */}
      <div className="flex items-center gap-3 mb-10">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${step > s ? 'bg-green-500 text-white' : step === s ? 'text-white' : 'text-gray-400 bg-gray-100'}`}
              style={step === s ? { background: 'var(--color-brand)' } : {}}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className="text-xs font-medium hidden sm:block" style={{ color: step === s ? 'var(--color-brand)' : 'var(--color-muted)' }}>
              {['Basic Info', 'Your Story', 'Activate'][i]}
            </span>
            {i < 2 && <div className="flex-1 h-px" style={{ background: step > s ? '#22c55e' : 'var(--color-border)' }} />}
          </div>
        ))}
      </div>

      <div className="card p-8">
        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Basic Information</h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Tell us what you're raising money for</p>
            </div>

            <div>
              <label className="label">Fundraiser Title *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Help pay for my mother's surgery" maxLength={100} />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-muted)' }}>{form.title.length}/100</p>
            </div>

            <div>
              <label className="label">Short Description *</label>
              <textarea className="input resize-none" rows={3} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="A brief summary of your fundraiser (shown on cards)" maxLength={300} />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-muted)' }}>{form.description.length}/300</p>
            </div>

            <div>
              <label className="label">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button"
                    onClick={() => set('category', cat.value)}
                    className="py-2.5 px-2 rounded-xl text-xs font-semibold border-2 transition-all text-center"
                    style={{
                      borderColor: form.category === cat.value ? cat.color : 'var(--color-border)',
                      background:  form.category === cat.value ? `${cat.color}15` : 'white',
                      color:       form.category === cat.value ? cat.color : 'var(--color-muted)',
                    }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label flex items-center justify-between">
                <span>Photos (optional)</span>
                {imageUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              </label>
              <div className="flex gap-3 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {form.images.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-orange-400"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <Upload className="w-5 h-5 mb-1" style={{ color: 'var(--color-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Add photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.urgent} onChange={e => set('urgent', e.target.checked)} />
              <span className="font-medium">Mark as Urgent</span>
              <span style={{ color: 'var(--color-muted)' }}>— shows urgent badge on your campaign</span>
            </label>
          </div>
        )}

        {/* ── Step 2: Story & Goal ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Your Story & Goal</h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>The more detail you share, the more people trust your cause</p>
            </div>

            <div>
              <label className="label">Full Story *</label>
              <textarea className="input resize-none" rows={8} value={form.story}
                onChange={e => set('story', e.target.value)}
                placeholder="Share your full story. Explain why you need the money, what it will be used for, and how donors can help. Be honest and specific — this builds trust." />
              <p className="text-xs mt-1" style={{ color: form.story.length < 50 ? '#e53e3e' : 'var(--color-muted)' }}>
                {form.story.length} characters {form.story.length < 50 ? `(minimum 50)` : '✓'}
              </p>
            </div>

            <div>
              <label className="label">Fundraising Goal (KES) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: 'var(--color-muted)' }}>KES</span>
                <input className="input pl-14" type="number" min={100}
                  value={form.goalAmount} onChange={e => set('goalAmount', e.target.value)}
                  placeholder="50000" />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Minimum KES 100</p>
            </div>

            <div>
              <label className="label">End Date <span className="font-normal" style={{ color: 'var(--color-muted)' }}>(optional)</span></label>
              <input type="date" className="input" value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            <div>
              <label className="label">M-Pesa Receiving Number *</label>
              <input className="input" type="tel" value={form.phoneNumber}
                onChange={e => set('phoneNumber', e.target.value)}
                placeholder="0712 345 678" />
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Donations and your activation prompt will go to this number</p>
            </div>

            <div>
              <label className="label">Paybill/Till Number <span className="font-normal" style={{ color: 'var(--color-muted)' }}>(optional)</span></label>
              <input className="input" value={form.paybillNumber}
                onChange={e => set('paybillNumber', e.target.value)}
                placeholder="123456" />
            </div>
          </div>
        )}

        {/* ── Step 3: Activate ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Activate Your Fundraiser</h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Pay KES {ACTIVATION_FEE} to go live — choose how you'd like to pay</p>
            </div>

            {/* How it works */}
            <div className="p-4 rounded-2xl border space-y-2.5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h3 className="font-semibold text-sm">How it works</h3>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                {[
                  `Pay a one-time KES ${ACTIVATION_FEE} activation fee to launch your fundraiser.`,
                  'Your fundraiser goes live and people can start donating immediately.',
                  'Once your goal is reached or end date passes, withdraw your funds. A 2.5% platform fee is deducted at withdrawal.',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method selector */}
            {!activationSent && (
              <div>
                <p className="text-sm font-semibold mb-2">Choose payment method</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* STK Push */}
                  <button type="button" onClick={() => setPayMethod('stk')}
                    className="p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: payMethod === 'stk' ? 'var(--color-brand)' : 'var(--color-border)',
                      background:  payMethod === 'stk' ? 'var(--color-brand)08' : 'white',
                    }}>
                    <Smartphone className="w-5 h-5 mb-2" style={{ color: payMethod === 'stk' ? 'var(--color-brand)' : 'var(--color-muted)' }} />
                    <p className="font-semibold text-sm">STK Push</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>M-Pesa prompt sent to your phone</p>
                  </button>

                  {/* Paybill */}
                  <button type="button" onClick={() => setPayMethod('paybill')}
                    className="p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: payMethod === 'paybill' ? 'var(--color-brand)' : 'var(--color-border)',
                      background:  payMethod === 'paybill' ? 'var(--color-brand)08' : 'white',
                    }}>
                    <Building2 className="w-5 h-5 mb-2" style={{ color: payMethod === 'paybill' ? 'var(--color-brand)' : 'var(--color-muted)' }} />
                    <p className="font-semibold text-sm">Paybill</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Pay manually via M-Pesa Paybill</p>
                  </button>
                </div>
              </div>
            )}

            {/* Paybill instructions */}
            {!activationSent && payMethod === 'paybill' && (
              <div className="p-4 rounded-2xl border space-y-2" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                <p className="font-semibold text-sm text-green-800">Pay via M-Pesa Paybill</p>
                <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                  <li>Go to M-Pesa → Lipa na M-Pesa → Pay Bill</li>
                  <li>Business No: <strong>247247</strong></li>
                  <li>Account No: <strong>ACT-{form.title.slice(0, 10).replace(/\s+/g, '-').toUpperCase()}</strong></li>
                  <li>Amount: <strong>KES {ACTIVATION_FEE}</strong></li>
                  <li>Enter your M-Pesa PIN and confirm</li>
                </ol>
                <p className="text-xs text-green-600 pt-1 border-t border-green-200">
                  Once payment is confirmed your fundraiser will go live automatically.
                </p>
                <button className="btn-primary w-full mt-1" onClick={() => router.push('/dashboard')}>
                  I've paid — Go to Dashboard
                </button>
              </div>
            )}

            {/* STK push flow */}
            {payMethod === 'stk' && (
              activationSent ? (
                <div className="p-4 rounded-2xl border text-center space-y-3" style={{ background: '#fffbeb', borderColor: '#fcd34d' }}>
                  <Smartphone className="w-8 h-8 mx-auto text-yellow-600" />
                  <p className="font-semibold text-yellow-800">M-Pesa prompt sent to {form.phoneNumber}</p>
                  <p className="text-sm text-yellow-700">Enter your M-Pesa PIN to complete activation. Your fundraiser goes live automatically once payment is confirmed.</p>
                  <button className="btn-primary w-full" onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="p-4 rounded-2xl border space-y-1.5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <p className="font-semibold text-sm">Fundraiser Summary</p>
                    <div className="text-sm space-y-0.5" style={{ color: 'var(--color-muted)' }}>
                      <p><span className="font-medium" style={{ color: 'var(--color-text)' }}>Title:</span> {form.title}</p>
                      <p><span className="font-medium" style={{ color: 'var(--color-text)' }}>Goal:</span> KES {Number(form.goalAmount).toLocaleString()}</p>
                      <p><span className="font-medium" style={{ color: 'var(--color-text)' }}>Prompt to:</span> {form.phoneNumber}</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleActivate} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                    Send KES {ACTIVATION_FEE} M-Pesa Prompt
                  </button>
                </>
              )
            )}
          </div>
        )}

        {/* Navigation */}
        {step < 3 && (
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button className="btn-secondary flex-1" onClick={() => setStep(s => (s - 1) as Step)}>
                Back
              </button>
            )}
            {step === 1 && (
              <button className="btn-primary flex-1" onClick={() => setStep(2)} disabled={!canNext()}>
                Continue
              </button>
            )}
            {step === 2 && (
              <button className="btn-primary flex-1" onClick={handleCreateFundraiser}
                disabled={loading || !canNext() || !form.phoneNumber}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Continue'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}