const parseDurationToMs = (value: string, fallbackMs: number): number => {
  const trimmed = String(value || '').trim();
  const match = /^(\d+)([smhd])$/i.exec(trimmed);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] || 0) || fallbackMs;
};

module.exports = { parseDurationToMs };
