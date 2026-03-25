'use client';
// components/fundraiser/FundraiserCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Fundraiser } from '@/types';
import { formatKES, calcProgress, getCategoryInfo, timeAgo } from '@/lib/utils';
import { Users, Clock, Zap, BadgeCheck } from 'lucide-react';

interface Props {
  fundraiser: Fundraiser;
  style?: React.CSSProperties;
  className?: string;
}

export default function FundraiserCard({ fundraiser, style, className = '' }: Props) {
  const progress = calcProgress(fundraiser.amountRaised, fundraiser.goalAmount);
  const catInfo = getCategoryInfo(fundraiser.category);

  return (
    <Link href={`/fundraisers/${fundraiser.slug}`} className={`card block group ${className}`} style={style}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {fundraiser.images?.[0] ? (
          <Image
            src={fundraiser.images[0]}
            alt={fundraiser.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: 'linear-gradient(135deg, #fff8ef, #ffecd6)' }}>
            {catInfo.label.split(' ')[0]}
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {fundraiser.urgent && (
            <span className="badge badge-urgent">
              <Zap className="w-3 h-3" /> Urgent
            </span>
          )}
          {fundraiser.verified && (
            <span className="badge badge-verified">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="badge badge-category">{catInfo.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
          {fundraiser.title}
        </h3>
        <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--color-muted)' }}>
          {fundraiser.description}
        </p>

        {/* Progress */}
        <div className="progress-bar mb-2">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
          <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
            {formatKES(fundraiser.amountRaised)}
          </span>
          <span>{progress}% of {formatKES(fundraiser.goalAmount)}</span>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {fundraiser.donorCount} donor{fundraiser.donorCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo(fundraiser.createdAt)}
          </span>
          <span className="font-medium truncate max-w-[90px]">
            by {fundraiser.creator?.name?.split(' ')[0] ?? 'Anonymous'}
          </span>
        </div>
      </div>
    </Link>
  );
}
