const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const getMillisecondsUntil = (expiresAt?: string) => {
  if (!expiresAt) return null;

  const value = new Date(expiresAt).getTime() - Date.now();
  return Number.isNaN(value) ? null : value;
};

export const formatRemovalBadge = (expiresAt?: string) => {
  const remaining = getMillisecondsUntil(expiresAt);

  if (remaining === null) {
    return { label: 'No expiry', tone: 'muted' as const };
  }

  if (remaining <= 0) {
    return { label: 'Expires soon', tone: 'danger' as const };
  }

  if (remaining < HOUR_MS) {
    const hours = Math.max(0.25, Math.ceil(remaining / (15 * 60 * 1000)) / 4);
    return { label: `Expires in ${hours.toFixed(hours % 1 === 0 ? 0 : 1)} hrs`, tone: 'danger' as const };
  }

  if (remaining < 6 * HOUR_MS) {
    return { label: `Expires in ${Math.ceil(remaining / HOUR_MS)} hrs`, tone: 'danger' as const };
  }

  if (remaining < DAY_MS) {
    return { label: `Expires in ${Math.ceil(remaining / HOUR_MS)} hrs`, tone: 'warning' as const };
  }

  return { label: `Expires in ${Math.ceil(remaining / DAY_MS)}d`, tone: 'muted' as const };
};

export const getBadgeToneClass = (tone: 'muted' | 'warning' | 'danger') => {
  switch (tone) {
    case 'danger':
      return 'border-red-500/40 bg-red-500/15 text-red-500 dark:text-red-300';
    case 'warning':
      return 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300';
    default:
      return 'border-border/70 bg-background text-muted-foreground';
  }
};
