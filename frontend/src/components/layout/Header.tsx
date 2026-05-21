export function Header({ lastUpdated }: { lastUpdated: Date | null }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-xl">🌤</span>
        <h1 className="text-base font-semibold tracking-wide text-slate-100">Weather Station</h1>
      </div>
      {lastUpdated && (
        <span className="text-xs text-slate-400">
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </header>
  );
}
