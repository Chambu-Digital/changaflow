'use client';
// components/fundraiser/DonateModal.tsx
import { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { formatKES } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Props {
  fundraiserId: string;
  fundraiserTitle: string;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

type Step = 'amount' | 'details' | 'waiting' | 'success' | 'failed';

export default function DonateModal({ fundraiserId, fundraiserTitle, onClose, onSuccess }: Props) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [donationId, setDonationId] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Poll for payment status
  useEffect(() => {
    if (step !== 'waiting' || !donationId) return;

    let attempts = 0;
    const maxAttempts = 24; // 2 mins

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setStep('failed');
        return;
      }

      try {
        const res = await fetch(`/api/mpesa/status?donationId=${donationId}`);
        const json = await res.json();

        if (json.status === 'confirmed') {
          clearInterval(interval);
          setPaidAmount(json.amount);
          setStep('success');
          onSuccess(json.amount);
        } else if (json.status === 'failed') {
          clearInterval(interval);
          setStep('failed');
        }
      } catch {
        // Continue polling
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, donationId, onSuccess]);

  const handleInitiate = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) { toast.error('Minimum donation is KES 10'); return; }
    if (!phone.match(/^(07|01|254|\+254)\d{8}$/)) { toast.error('Enter a valid Safaricom number'); return; }
    if (!name.trim()) { toast.error('Enter your name'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fundraiserId, phoneNumber: phone, amount: amt, donorName: name, message, anonymous }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDonationId(json.donationId);
      setStep('waiting');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="card w-full max-w-md relative animate-fade-up" style={{ background: 'white' }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Amount step */}
          {step === 'amount' && (
            <>
              <h2 className="font-display text-xl font-bold mb-1">Choose amount</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>Donating to: <span className="font-medium">{fundraiserTitle}</span></p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {QUICK_AMOUNTS.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className="py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: amount === String(a) ? 'var(--color-brand)' : 'var(--color-border)',
                      background: amount === String(a) ? '#fff8f0' : 'white',
                      color: amount === String(a) ? 'var(--color-brand)' : 'var(--color-text)',
                    }}
                  >
                    {formatKES(a)}
                  </button>
                ))}
              </div>

              <div className="relative mb-5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--color-muted)' }}>KES</span>
                <input
                  type="number"
                  placeholder="Or enter amount"
                  className="input pl-14"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={10}
                />
              </div>

              <button
                className="btn-primary w-full"
                onClick={() => { if (Number(amount) >= 10) setStep('details'); else toast.error('Minimum is KES 10'); }}
                disabled={!amount}
              >
                Continue
              </button>
            </>
          )}

          {/* Details step */}
          {step === 'details' && (
            <>
              <button onClick={() => setStep('amount')} className="text-sm mb-4 flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                ← Back
              </button>
              <h2 className="font-display text-xl font-bold mb-1">Your details</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>Donating <strong>{formatKES(Number(amount))}</strong> via M-Pesa</p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="John Kamau" />
                </div>
                <div>
                  <label className="label">M-Pesa Number</label>
                  <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" type="tel" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>You'll receive an M-Pesa prompt on this number</p>
                </div>
                <div>
                  <label className="label">Message <span className="font-normal" style={{ color: 'var(--color-muted)' }}>(optional)</span></label>
                  <input className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Sending support 🙏" maxLength={200} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="rounded" />
                  Donate anonymously
                </label>
              </div>

              <button className="btn-primary w-full" onClick={handleInitiate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                {loading ? 'Sending prompt...' : 'Pay with M-Pesa'}
              </button>
            </>
          )}

          {/* Waiting step */}
          {step === 'waiting' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-soft" style={{ background: '#fff8f0' }}>
                <Smartphone className="w-8 h-8" style={{ color: 'var(--color-brand)' }} />
              </div>
              <h2 className="font-display text-xl font-bold mb-2">Check your phone</h2>
              <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>
                An M-Pesa prompt has been sent to <strong>{phone}</strong>
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                Enter your M-Pesa PIN to complete the donation of <strong>{formatKES(Number(amount))}</strong>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Waiting for confirmation...
              </div>
            </div>
          )}

          {/* Success step */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-display text-xl font-bold mb-2">Asante sana! 🙏</h2>
              <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>Your donation of</p>
              <p className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--color-forest)' }}>{formatKES(paidAmount)}</p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>was received successfully!</p>
              <button className="btn-primary w-full" onClick={onClose}>Done</button>
            </div>
          )}

          {/* Failed step */}
          {step === 'failed' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="font-display text-xl font-bold mb-2">Payment not completed</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                The M-Pesa payment was cancelled or timed out. You were not charged.
              </p>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep('details')}>Try Again</button>
                <button className="btn-primary flex-1" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
