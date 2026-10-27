/** Pure helpers; monetary values are returned as integer santim, never floating-point money. */
export function parseBirrToMinor(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const match = /\d[\d,]*(?:\.\d+)?/.exec(String(value));
  if (!match) return null;
  const [whole, fraction = ''] = match[0].replace(/,/g, '').split('.');
  const amount = Number(whole) * 100 + Number((fraction + '00').slice(0, 2)) + (fraction.length > 2 && fraction[2] >= '5' ? 1 : 0);
  return Number.isSafeInteger(amount) ? amount : null;
}

/** Date parser intentionally returns null rather than guessing ambiguous dates. */
export function parseProviderDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeReceiver(value: string): string {
  let normalized = value.toLowerCase().normalize('NFKC').replace(/[\s\-().+]/g, '').trim();

  // If it starts with local prefix '0', convert it to '251'
  if (/^0\d{9}$/.test(normalized)) {
    normalized = `251${normalized.slice(1)}`;
  }

  return normalized;
}
