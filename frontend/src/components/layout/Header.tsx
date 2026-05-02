import { useAuth } from '../../contexts/AuthContext';

export function Header({ lastUpdated }: { lastUpdated: Date | null }) {
  const { username, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-xl">🌤</span>
        <h1 className="text-base font-semibold tracking-wide text-slate-100">Weather Station</h1>
      </div>
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="hidden text-xs text-slate-400 sm:block">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <span className="text-xs text-slate-400">{username}</span>
        <button
          onClick={logout}
          className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
