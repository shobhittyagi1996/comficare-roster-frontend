export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Handles overnight shifts (e.g. 22:00 -> 06:00) by wrapping past midnight */
export function shiftDurationMinutes(startTime: string, endTime: string, breakMinutes = 0): number {
  let start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);
  if (end <= start) end += 24 * 60;
  return Math.max(0, end - start - breakMinutes);
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime12(startTime)} – ${formatTime12(endTime)}`;
}

function formatTime12(t: string): string {
  const [hStr, m] = t.split(':');
  let h = Number(hStr);
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return m === '00' ? `${h}${suffix}` : `${h}:${m}${suffix}`;
}
