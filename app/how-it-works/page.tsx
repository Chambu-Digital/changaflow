// app/how-it-works/page.tsx
import Link from 'next/link';
import { ArrowRight, Heart, Share2, Smartphone, ShieldCheck, Zap, Users, TrendingUp, MessageCircle } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Heart,
    title: 'Create your fundraiser',
    desc: 'Fill in your title, story, goal, and M-Pesa number. No documents required. Takes less than 2 minutes.',
    tip: '💡 Tip: Fundraisers with photos raise 3x more.',
  },
  {
    number: '02',
    icon: Share2,
    title: 'Share with your network',
    desc: 'Share to WhatsApp, SMS, Facebook — or copy the link. Our auto-generated message makes sharing dead simple.',
    tip: '💡 Tip: WhatsApp shares get the most donations.',
  },
  {
    number: '03',
    icon: Smartphone,
    title: 'Collect via M-Pesa',
    desc: 'Donors click "Donate", enter an amount, and get an M-Pesa STK push. The money goes directly to your number.',
    tip: '💡 Tip: Post regular updates to build trust.',
  },
];

const FEES = [
  { label: 'Platform fee', value: '2.5% per donation' },
  { label: 'M-Pesa charges', value: 'Standard Safaricom rates' },
  { label: 'Withdrawal', value: 'Instant to your M-Pesa' },
  { label: 'Minimum donation', value: 'KES 10' },
];

const TRUST = [
  { icon: ShieldCheck, title: 'Optional Verification', desc: 'Get a verified badge by submitting ID. Builds donor confidence.' },
  { icon: TrendingUp,  title: 'Progress Updates',      desc: 'Post updates to keep donors informed. Increases repeat donations.' },
  { icon: Users,       title: 'Community Reporting',   desc: 'Donors can flag suspicious campaigns. Our team reviews within 24h.' },
  { icon: MessageCircle, title: 'Donor Comments',      desc: 'Donors can leave messages of support on your campaign.' },
  { icon: Zap,         title: 'Urgent Flag',           desc: 'Mark campaigns as urgent for higher visibility in search.' },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <div className="text-center mb-16">
        <h1 className="font-display text-5xl font-bold mb-4">How FundMi Works</h1>
        <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
          Kenya's simplest fundraising platform powered by M-Pesa
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8 mb-20">
        {STEPS.map((s, i) => (
          <div key={i} className="card p-8 flex gap-6">
            <div>
              <div className="font-display text-6xl font-bold opacity-10 leading-none">{s.number}</div>
             
            </div>
            <div>
              <h2 className="font-display text-xl font-bold mb-2">{s.title}</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>{s.desc}</p>
              
            </div>
          </div>
        ))}
      </div>

      {/* Fees */}
      <div className="card p-8 mb-12">
        <h2 className="font-display text-2xl font-bold mb-6">Fees & Charges</h2>
        <div className="grid grid-cols-2 gap-4">
          {FEES.map((f, i) => (
            <div key={i} className="p-4 rounded-2xl" style={{ background: 'var(--color-surface)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>{f.label.toUpperCase()}</p>
              <p className="font-semibold">{f.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--color-muted)' }}>
          * FundMi charges a 2.5% platform fee on each successful donation to keep the service running. There are no monthly fees or setup costs.
        </p>
      </div>

      {/* Trust */}
      <div className="mb-16">
        <h2 className="font-display text-2xl font-bold mb-6">How We Build Trust</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TRUST.map((t, i) => (
            <div key={i} className="card p-5 flex gap-4">
             
              <div>
                <h3 className="font-semibold text-sm mb-1">{t.title}</h3>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold mb-4">Ready to start?</h2>
        <p className="mb-6" style={{ color: 'var(--color-muted)' }}>Create your first fundraiser. It's free and takes 2 minutes.</p>
        <Link href="/create" className="btn-primary text-base px-8 py-4">
          Start Fundraiser <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
