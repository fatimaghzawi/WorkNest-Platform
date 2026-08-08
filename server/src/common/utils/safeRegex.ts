/**
 * Escape user input before embedding in RegExp (ReDoS / injection hardening).
 */
const escapeRegExp = (value: string): string =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toSafeSearchRegex = (value: unknown, { maxLength = 100 }: { maxLength?: number } = {}) => {
  const raw = String(value || '').trim().slice(0, maxLength);
  if (!raw) return null;
  return new RegExp(escapeRegExp(raw), 'i');
};

module.exports = {
  escapeRegExp,
  toSafeSearchRegex,
};
