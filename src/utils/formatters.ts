/**
 * Formatting helpers for dates, times, coordinates, and crisis labels.
 */

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  } catch {
    return 'Recent';
  }
}

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '10:42 AM';
  }
}

export function formatCategoryLabel(category: string): string {
  switch (category) {
    case 'FLOOD':
      return 'Flood / Flash Hazard';
    case 'FIRE':
      return 'Fire / Smoke Hazard';
    case 'TRAFFIC':
      return 'Major Traffic Incident';
    case 'POWER_OUTAGE':
      return 'Power / Grid Outage';
    case 'HAZMAT':
      return 'Hazardous Material Spill';
    case 'EARTHQUAKE':
      return 'Earthquake / Seismic';
    case 'MEDICAL':
      return 'Mass Medical Emergency';
    case 'STRUCTURE_COLLAPSE':
      return 'Structural Collapse';
    default:
      return category.replace('_', ' ');
  }
}

export function formatSeverityColor(severity: string) {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-600',
        text: 'text-red-700',
        lightBg: 'bg-red-50',
        border: 'border-red-200',
        dot: 'bg-red-600',
        badgeBg: 'bg-[#ba1a1a]/10',
        badgeText: 'text-[#ba1a1a]',
        badgeBorder: 'border-[#ba1a1a]/20',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-600',
        text: 'text-amber-700',
        lightBg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-[#f59e0b]',
        badgeBg: 'bg-[#f59e0b]/10',
        badgeText: 'text-[#d97706]',
        badgeBorder: 'border-[#f59e0b]/20',
      };
    case 'ACTIVE':
    case 'MEDIUM':
      return {
        bg: 'bg-blue-600',
        text: 'text-blue-700',
        lightBg: 'bg-blue-50',
        border: 'border-blue-200',
        dot: 'bg-[#0051d5]',
        badgeBg: 'bg-[#0051d5]/10',
        badgeText: 'text-[#0051d5]',
        badgeBorder: 'border-[#0051d5]/20',
      };
    default:
      return {
        bg: 'bg-emerald-600',
        text: 'text-emerald-700',
        lightBg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dot: 'bg-[#059669]',
        badgeBg: 'bg-[#059669]/10',
        badgeText: 'text-[#059669]',
        badgeBorder: 'border-[#059669]/20',
      };
  }
}
