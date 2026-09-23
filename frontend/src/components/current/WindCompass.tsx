import { useState, useEffect } from 'react';

const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

function degToDir(deg: number) {
  return DIRS[Math.round(deg / 22.5) % 16];
}

export function WindCompass({ degrees, speed, gust, unit }: {
  degrees: number | null;
  speed: string | null;
  gust: string | null;
  unit: string;
}) {
  const deg = degrees ?? 0;
  const [maxGust, setMaxGust] = useState<number>(0);

  useEffect(() => {
    const current = parseFloat(gust ?? '0');
    if (!isNaN(current) && current > maxGust) setMaxGust(current);
  }, [gust]);

  return (
    <div className="flex items-center gap-6 rounded-xl bg-slate-700 p-4 shadow">
      {/* Compass */}
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full text-slate-500">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* Tick marks */}
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i * 22.5 - 90) * (Math.PI / 180);
            const inner = i % 4 === 0 ? 36 : 40;
            const outer = 44;
            return (
              <line
                key={i}
                x1={50 + inner * Math.cos(angle)} y1={50 + inner * Math.sin(angle)}
                x2={50 + outer * Math.cos(angle)} y2={50 + outer * Math.sin(angle)}
                stroke={i % 4 === 0 ? '#94a3b8' : '#475569'} strokeWidth={i % 4 === 0 ? 1.5 : 1}
              />
            );
          })}
          {/* Cardinal labels */}
          {['N','E','S','W'].map((d, i) => {
            const angle = (i * 90 - 90) * (Math.PI / 180);
            const x = 50 + 28 * Math.cos(angle);
            const y = 50 + 28 * Math.sin(angle);
            return <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#94a3b8">{d}</text>;
          })}
          {/* Arrow */}
          <g transform={`rotate(${deg}, 50, 50)`}>
            <polygon points="50,8 54,50 50,42 46,50" fill="#2dd4bf" />
            <polygon points="50,92 54,50 50,58 46,50" fill="#64748b" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#2dd4bf" />
        </svg>
      </div>

      {/* Wind data */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Wind</span>
        <div>
          <div className="text-3xl font-extrabold text-teal-400">
            {speed ?? '—'}
            <span className="ml-1 text-base font-normal text-slate-400">{unit}</span>
          </div>
          <div className="mt-0.5 text-sm text-slate-400">
            {degrees != null ? `${degToDir(degrees)} · ${Math.round(degrees)}°` : '—'}
          </div>
        </div>
        {gust && (
          <div className="rounded-lg bg-slate-600/60 px-3 py-1.5">
            <div>
              <span className="text-xs text-slate-400">Gust</span>
              <span className="ml-2 text-sm font-bold text-yellow-400">{gust} {unit}</span>
            </div>
            {maxGust > 0 && (
              <div className="mt-0.5">
                <span className="text-xs text-slate-500">Max </span>
                <span className="text-xs font-bold text-orange-400">{maxGust.toFixed(1)} {unit}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
