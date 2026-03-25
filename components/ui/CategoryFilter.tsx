'use client';
// components/ui/CategoryFilter.tsx
import { CATEGORIES } from '@/lib/utils';

interface Props {
  selected: string;
  onChange: (val: string) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  const stripEmoji = (label: string) => label.replace(/^[^\w\s]+\s*/, '');
  const all = [{ value: 'all', label: '🌍 All', color: '#a07840' }, ...CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {all.map(cat => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className="flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold border-2 transition-all whitespace-nowrap"
          style={{
            borderColor: selected === cat.value ? cat.color : 'var(--color-border)',
            background:  selected === cat.value ? `${cat.color}15` : 'white',
            color:       selected === cat.value ? cat.color : 'var(--color-muted)',
          }}
        >
          {stripEmoji(cat.label)}
        </button>
      ))}
    </div>
  );
}
