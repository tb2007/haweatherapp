import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { HistoryPoint } from '../../api/client';

interface Series {
  key: string;
  label: string;
  color: string;
  data: HistoryPoint[];
}

interface Props {
  series: Series[];
  unit?: string;
  height?: number;
  yDomain?: [number | 'auto', number | 'auto'];
  decimals?: number;
  yAxisWidth?: number;
}

function mergeTimelines(seriesList: Series[]) {
  const map = new Map<number, Record<string, number>>();
  for (const s of seriesList) {
    for (const pt of s.data) {
      if (!map.has(pt.t)) map.set(pt.t, { t: pt.t });
      map.get(pt.t)![s.key] = pt.v;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.t - b.t);
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function BaseChart({ series, unit = '', height = 200, yDomain = ['auto', 'auto'], decimals = 1, yAxisWidth }: Props) {
  const merged = mergeTimelines(series);
  const leftMargin = yAxisWidth ? 0 : -16;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={merged} margin={{ top: 4, right: 8, left: leftMargin, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="t"
          type="number"
          domain={['dataMin', 'dataMax']}
          scale="time"
          tickFormatter={fmtTime}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={60}
        />
        <YAxis
          domain={yDomain}
          width={yAxisWidth}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit={unit ? ` ${unit}` : undefined}
          tickFormatter={(v: number) => v.toFixed(decimals)}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#94a3b8', fontSize: 11 }}
          labelFormatter={(v) => new Date(v as number).toLocaleString()}
          formatter={(v: number, name: string) => [`${v.toFixed(decimals)} ${unit}`, name]}
        />
        {series.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        )}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            fill={`url(#grad-${s.key})`}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
