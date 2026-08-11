export function ProgressIndicator({
  index,
  total,
}: {
  index: number;
  total: number;
}) {
  const pct = ((index + 1) / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-sm font-semibold tabular-nums text-wn-ink">
        {String(index + 1).padStart(2, '0')}
        <span className="text-wn-faint"> / {String(total).padStart(2, '0')}</span>
      </span>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-wn-line/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-wn-primary to-wn-orange transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
