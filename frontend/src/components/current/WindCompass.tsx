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

  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-800 p-4 shadow">
      <span className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-400">Wind</span>
      <div className="relative h-24 w-24">
        {/* compass ring */}
        <svg viewBox="0 0 100 100" className="h-full w-full text-slate-600">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" />
          {['N','E','S','W'].map((d, i) => {
            const angle = i * 90 - 90;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 36 * Math.cos(rad);
            const y = 50 + 36 * Math.sin(rad);
            return <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#94a3b8">{d}</text>;
          })}
          {/* arrow */}
          <g transform={`rotate(${deg}, 50, 50)`}>
            <polygon points="50,10 54,50 50,44 46,50" fill="#38bdf8" />
            <polygon points="50,90 54,50 50,56 46,50" fill="#475569" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#38bdf8" />
        </svg>
      </div>
      <div className="mt-2 text-center">
        <div className="text-lg font-bold text-sky-400">
          {speed ?? '—'} <span className="text-sm font-normal text-slate-400">{unit}</span>
        </div>
        <div className="text-xs text-slate-400">
          {degrees != null ? `${degToDir(degrees)} (${Math.round(degrees)}°)` : '—'}
        </div>
        {gust && <div className="text-xs text-slate-500">Gust: {gust} {unit}</div>}
      </div>
    </div>
  );
}
