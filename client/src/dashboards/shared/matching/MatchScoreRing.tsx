type Props = {
  score: number;
  size?: number;
  label?: string;
};

/** Circular fit meter — visual only, no hire side effects. */
export default function MatchScoreRing({ score, size = 52, label = 'fit' }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const stroke = 3.5;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div
      className="wn-match-ring"
      style={{ width: size, height: size }}
      title={`${clamped}% match`}
      aria-label={`${clamped} percent ${label}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          className="wn-match-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="wn-match-ring__arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="wn-match-ring__label">
        <span className="wn-match-ring__value">{clamped}</span>
        <span className="wn-match-ring__unit">%</span>
      </div>
    </div>
  );
}
