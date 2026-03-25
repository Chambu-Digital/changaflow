'use client';
// components/fundraiser/ShareButton.tsx
import { useState } from 'react';
import { Share2, MessageCircle, Link2, Check } from 'lucide-react';
import { generateShareText } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  title: string;
  raised: number;
  goal: number;
  slug: string;
}

export default function ShareButton({ title, raised, goal, slug }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/fundraisers/${slug}`;
  const text = generateShareText(title, raised, goal, url);

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setOpen(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, text, url });
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="relative">
      <button
        className="btn-secondary gap-2 text-sm py-2.5"
        onClick={nativeShare}
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 card py-2 z-50">
            <button onClick={shareWhatsApp} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-green-50 w-full transition-colors text-left">
              <MessageCircle className="w-4 h-4 text-green-500" />
              Share on WhatsApp
            </button>
            <button onClick={copyLink} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-orange-50 w-full transition-colors text-left">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
