import { useState } from 'react';
import { useCurrentWeather } from '../hooks/useCurrentWeather';
import { POLL_INTERVAL_MS } from '../constants/entities';
import { Header } from '../components/layout/Header';
import { WeatherHero } from '../components/current/WeatherHero';
import { RainPanel } from '../components/current/RainPanel';
import { HourlyForecast } from '../components/forecast/HourlyForecast';
import { AlertBanner } from '../components/alerts/AlertBanner';
import { WebcamPanel } from '../components/webcam/WebcamPanel';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { PressureChart } from '../components/charts/PressureChart';
import { WindChart } from '../components/charts/WindChart';
import { DailyRainChart } from '../components/charts/DailyRainChart';
import { TimeRangePicker } from '../components/ui/TimeRangePicker';

type Tab = 'current' | 'history';

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-300">
      <span className={`inline-block h-4 w-1 rounded ${color}`} />
      {children}
    </h2>
  );
}

export function Dashboard() {
  const { dataUpdatedAt } = useCurrentWeather();
  const lastFetched = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const [tab, setTab] = useState<Tab>('current');
  const [hours, setHours] = useState(24);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800/80">
      <Header lastUpdated={lastFetched} pollIntervalMs={POLL_INTERVAL_MS} />

      {/* Desktop tab bar — hidden on mobile */}
      <div className="sticky top-[53px] z-40 hidden border-b border-slate-700/60 bg-slate-900/90 px-4 backdrop-blur lg:block sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-1 py-2">
          {(['current', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <main className="flex-1 px-4 py-6 pb-24 lg:pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {tab === 'current' && (
            <>
              <AlertBanner />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <SectionTitle color="bg-sky-500">Current Conditions</SectionTitle>
                  <WeatherHero />
                </div>
                <div>
                  <SectionTitle color="bg-violet-500">Hourly Forecast</SectionTitle>
                  <HourlyForecast />
                </div>
              </div>

              <div>
                <SectionTitle color="bg-blue-500">Rainfall</SectionTitle>
                <RainPanel />
              </div>

              <WebcamPanel />
            </>
          )}

          {tab === 'history' && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <SectionTitle color="bg-emerald-500">Historical Data</SectionTitle>
                <TimeRangePicker hours={hours} onChange={setHours} />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <TemperatureChart hours={hours} />
                </div>
                <WindChart hours={hours} />
                <PressureChart hours={hours} />
                <div className="lg:col-span-2">
                  <DailyRainChart />
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      <footer className="border-t border-slate-700/60 py-3 text-center text-xs text-slate-500 pb-24 lg:pb-3">
        Lakewood, CO · Green Mountain Weather
      </footer>

      {/* Mobile bottom nav — hidden on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-700/60 bg-slate-900/95 backdrop-blur lg:hidden">
        {(['current', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xl">{t === 'current' ? '🌡️' : '📊'}</span>
            {t}
          </button>
        ))}
      </nav>
    </div>
  );
}
