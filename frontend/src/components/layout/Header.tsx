import { useState, useEffect } from 'react';

export function Header({ lastUpdated, pollIntervalMs }: { lastUpdated: Date | null; pollIntervalMs: number }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!lastUpdated) return;
    const tick = () => {
      const elapsed = (Date.now() - lastUpdated.getTime()) / 1000;
      setSecondsLeft(Math.max(0, Math.round(pollIntervalMs / 1000 - elapsed)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated, pollIntervalMs]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-xl">🌤</span>
        <h1 className="text-base font-semibold tracking-wide text-slate-800">Green Mountain Weather</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="text-xs text-slate-500">
          {secondsLeft !== null ? `Next update in ${secondsLeft}s` : 'Connecting...'}
        </span>
      </div>
    </header>
  );
}
