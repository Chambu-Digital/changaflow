// components/ui/EmptyState.tsx
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  action?: { label: string; href: string };
}

export default function EmptyState({
  title = 'No fundraisers found',
  description = 'Be the first to start a fundraiser in this category.',
  action = { label: 'Start a Fundraiser', href: '/create' },
}: Props) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-surface)' }}>
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
