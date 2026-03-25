// lib/utils.ts

export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calcProgress(raised: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export function generateShareText(title: string, raised: number, goal: number, url: string): string {
  const progress = calcProgress(raised, goal);
  return `🙏 Help me: "${title}"\n\nWe've raised ${formatKES(raised)} of ${formatKES(goal)} (${progress}%)\n\nDonate here 👉 ${url}`;
}

export const CATEGORIES = [
  { value: 'medical',   label: 'Medical',   color: '#e53e3e' },
  { value: 'education', label: 'Education',  color: '#3182ce' },
  { value: 'business',  label: 'Business',   color: '#d69e2e' },
  { value: 'funeral',   label: 'Funeral',    color: '#718096' },
  { value: 'emergency', label: 'Emergency',  color: '#dd6b20' },
  { value: 'community', label: 'Community',  color: '#38a169' },
  { value: 'religious', label: 'Religious',  color: '#6b46c1' },
  { value: 'other',     label: 'Other',      color: '#319795' },
] as const;

export function getCategoryInfo(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}
