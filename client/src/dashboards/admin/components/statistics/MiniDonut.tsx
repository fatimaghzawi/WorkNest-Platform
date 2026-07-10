import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartLegend, GlassTooltip } from './chartHelpers';

export default function MiniDonut({
  title,
  data,
  colors,
  centerLabel,
  centerValue,
}: {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
  centerLabel: string;
  centerValue: string | number;
}) {
  const legendItems = data.map((item, index) => ({
    label: item.name,
    value: item.value,
    color: colors[index % colors.length],
  }));

  if (data.length === 0) {
    return (
      <div className="wn-stats-mini-donut wn-stats-mini-donut--empty">
        <p>{title}</p>
        <span>No data</span>
      </div>
    );
  }

  return (
    <div className="wn-stats-mini-donut">
      {title ? <p className="wn-stats-mini-donut__title">{title}</p> : null}
      <div className="wn-stats-mini-donut__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={4}
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="wn-stats-mini-donut__center">
          <strong>{centerValue}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ChartLegend items={legendItems} />
    </div>
  );
}
