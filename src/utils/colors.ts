// Deterministic color assignment so the same employee/position always gets the same color.
// These are decorative/categorical palettes (avatars, position groups) — distinct from the
// Design System's semantic status colors (success/warning/error/info), which are reserved
// for shift state (Locked/Open/Open+Approval) so the two layers never collide visually.

const AVATAR_PALETTE = [
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
];

const POSITION_PALETTE = [
  { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-800' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-300', text: 'text-fuchsia-800' },
  { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-800' },
  { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800' },
  { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-800' },
  { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarColor(seed: string) {
  return AVATAR_PALETTE[hashString(seed) % AVATAR_PALETTE.length];
}

export function positionColor(seed: string) {
  return POSITION_PALETTE[hashString(seed) % POSITION_PALETTE.length];
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}
