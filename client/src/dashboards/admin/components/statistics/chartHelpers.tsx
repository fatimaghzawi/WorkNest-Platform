import type { TooltipProps } from 'recharts';
import { formatCurrency } from '../../../../utils/format';

export const CHART = {
  purple: '#49225B',
  violet: '#6E3482',
  lavender: '#A56ABD',
  blush: '#F5EBFA',
  orange: '#F97316',
  coral: '#FB7185',
  teal: '#14B8A6',
  mint: '#5EEAD4',
  blue: '#3B82F6',
  sky: '#7DD3FC',
  yellow: '#FBBF24',
  pink: '#EC4899',
  green: '#22C55E',
  indigo: '#6366F1',
};

export const PALETTE = [
  CHART.purple,
  CHART.orange,
  CHART.teal,
  CHART.blue,
  CHART.pink,
  CHART.yellow,
  CHART.green,
  CHART.coral,
  CHART.lavender,
  CHART.indigo,
];

export const JOB_COLORS = [CHART.purple, CHART.orange, CHART.teal];
export const PROPOSAL_COLORS = [CHART.yellow, CHART.green, CHART.coral];
export const PROJECT_COLORS = [CHART.blue, CHART.green, CHART.pink];

type ChartTooltipProps = TooltipProps<number, string>;

export function GlassTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="wn-stats-tooltip">
      {label && <p className="wn-stats-tooltip__label">{label}</p>}
      <ul className="wn-stats-tooltip__list">
        {payload.map((entry) => (
          <li key={String(entry.name)}>
            <span className="wn-stats-tooltip__dot" style={{ background: entry.color }} />
            <span>{entry.name}</span>
            <strong>
              {entry.name?.toString().toLowerCase().includes('budget')
                ? formatCurrency(Number(entry.value))
                : Number(entry.value).toLocaleString()}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="wn-stats-legend-pills">
      {items.map((item) => (
        <div key={item.label} className="wn-stats-legend-pill">
          <span className="wn-stats-legend-pill__swatch" style={{ background: item.color }} />
          <span className="wn-stats-legend-pill__label">{item.label}</span>
          <strong>{item.value}</strong>
          <em>{Math.round((item.value / total) * 100)}%</em>
        </div>
      ))}
    </div>
  );
}

export function RankedBars({
  items,
  valueKey,
  labelKey,
  formatValue,
}: {
  items: Record<string, string | number>[];
  valueKey: string;
  labelKey: string;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <div className="wn-stats-ranked">
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const pct = Math.round((value / max) * 100);
        const color = PALETTE[index % PALETTE.length];

        return (
          <div key={String(item[labelKey])} className="wn-stats-ranked__row">
            <div className="wn-stats-ranked__meta">
              <span className="wn-stats-ranked__rank">{index + 1}</span>
              <span className="wn-stats-ranked__name">{item[labelKey]}</span>
              <strong>
                {formatValue ? formatValue(value) : value.toLocaleString()}
              </strong>
            </div>
            <div className="wn-stats-ranked__track">
              <span
                className="wn-stats-ranked__fill"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  boxShadow: `0 0 18px ${color}44`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
