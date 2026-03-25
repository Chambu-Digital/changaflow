// components/layout/Footer.tsx
import Link from 'next/link';


export default function Footer() {
  return (
    <footer className="border-t mt-20" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg mb-3" style={{ color: 'var(--color-brand)' }}>
              ChangaFlow
            </Link>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Kenya's fastest fundraising platform. Powered by M-Pesa.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Fundraise</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li><Link href="/create" className="hover:text-brand-500 transition-colors">Start a Fundraiser</Link></li>
              <li><Link href="/browse" className="hover:text-brand-500 transition-colors">Browse Campaigns</Link></li>
              <li><Link href="/how-it-works" className="hover:text-brand-500 transition-colors">How it Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Categories</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li><Link href="/browse?category=medical" className="hover:text-brand-500 transition-colors">Medical</Link></li>
              <li><Link href="/browse?category=education" className="hover:text-brand-500 transition-colors">Education</Link></li>
              <li><Link href="/browse?category=emergency" className="hover:text-brand-500 transition-colors">Emergency</Link></li>
              <li><Link href="/browse?category=business" className="hover:text-brand-500 transition-colors">Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li><Link href="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
              <li><Link href="/trust-safety" className="hover:text-brand-500 transition-colors">Trust & Safety</Link></li>
              <li><Link href="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
          <p>© {new Date().getFullYear()} ChangaFlow Kenya Ltd. All rights reserved.</p>
          <p>Built for Kenya 🇰🇪 · Powered by M-Pesa</p>
        </div>
      </div>
    </footer>
  );
}
