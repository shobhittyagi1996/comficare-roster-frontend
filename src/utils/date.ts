export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

export function generateDays(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' });
}

export const TIMELINE_DAYS: Record<'1week' | '2week' | '1month', number> = {
  '1week': 7,
  '2week': 14,
  '1month': 30,
};
