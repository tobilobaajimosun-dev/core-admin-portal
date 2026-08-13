/** Common date-range shortcuts, Mercury-style — computed against "today" so
 * they stay correct without persisting stale absolute dates. */
export interface DatePreset {
  key: string;
  label: string;
  range(): { from: string; to: string };
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - n);
  return d;
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day + 6) % 7; // Monday-start week
  copy.setDate(copy.getDate() - diff);
  return copy;
}

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const DATE_PRESETS: DatePreset[] = [
  { key: 'all', label: 'All time', range: () => ({ from: '', to: '' }) },
  { key: 'today', label: 'Today', range: () => ({ from: iso(today()), to: iso(today()) }) },
  { key: 'yesterday', label: 'Yesterday', range: () => ({ from: iso(daysAgo(1)), to: iso(daysAgo(1)) }) },
  { key: 'this-week', label: 'This week', range: () => ({ from: iso(startOfWeek(today())), to: iso(today()) }) },
  { key: 'this-month', label: 'This month', range: () => { const d = today(); return { from: iso(new Date(d.getFullYear(), d.getMonth(), 1)), to: iso(d) }; } },
  { key: 'this-year', label: 'This year', range: () => { const d = today(); return { from: iso(new Date(d.getFullYear(), 0, 1)), to: iso(d) }; } },
  { key: 'last-week', label: 'Last week', range: () => { const start = startOfWeek(today()); const lastStart = new Date(start); lastStart.setDate(lastStart.getDate() - 7); const lastEnd = new Date(start); lastEnd.setDate(lastEnd.getDate() - 1); return { from: iso(lastStart), to: iso(lastEnd) }; } },
  { key: 'last-month', label: 'Last month', range: () => { const d = today(); const lastMonthEnd = new Date(d.getFullYear(), d.getMonth(), 0); const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1); return { from: iso(lastMonthStart), to: iso(lastMonthEnd) }; } },
  { key: 'last-30', label: 'Last 30 days', range: () => ({ from: iso(daysAgo(30)), to: iso(today()) }) },
  { key: 'last-90', label: 'Last 90 days', range: () => ({ from: iso(daysAgo(90)), to: iso(today()) }) },
  { key: 'last-6-months', label: 'Last 6 months', range: () => ({ from: iso(monthsAgo(6)), to: iso(today()) }) },
  { key: 'custom', label: 'Custom', range: () => ({ from: '', to: '' }) },
];

/** Reverse lookup: which preset (if any) matches the given from/to pair.
 * Falls back to 'custom' when something's set but doesn't match a preset,
 * or 'all' when both are empty. */
export function matchDatePreset(from: string, to: string): string {
  if (!from && !to) return 'all';
  for (const preset of DATE_PRESETS) {
    if (preset.key === 'all' || preset.key === 'custom') continue;
    const r = preset.range();
    if (r.from === from && r.to === to) return preset.key;
  }
  return 'custom';
}
