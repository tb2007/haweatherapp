import { useState } from 'react';
import { useCurrentWeather, lastUpdated } from '../hooks/useCurrentWeather';
import { ENTITIES } from '../constants/entities';
import { Header } from '../components/layout/Header';
import { WeatherHero } from '../components/current/WeatherHero';
import { RainPanel } from '../components/current/RainPanel';
import { AQIPanel } from '../components/current/AQIPanel';
import { HourlyForecast } from '../components/forecast/HourlyForecast';
import { AlertBanner } from '../components/alerts/AlertBanner';
import { WebcamPanel } from '../components/webcam/WebcamPanel';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { PressureChart } from '../components/charts/PressureChart';
import { WindChart } from '../components/charts/WindChart';
import { RainChart } from '../components/charts/RainChart';
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
  const { data } = useCurrentWeather();
  const updated = lastUpdated(data, ENTITIES.temperature);
  const [tab, setTab] = useState<Tab>('current');
  const [hours, setHours] = useState(24);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800/80">
      <Header lastUpdated={updated} />

      {/* Tab bar */}
      <div className="sticky top-[53px] z-40 border-b border-slate-700/60 bg-slate-900/90 px-4 backdrop-blur sm:px-6 lg:px-8">
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

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {tab === 'current' && (
            <>
              <AlertBanner />

              {/* Hero + forecast side-by-side on desktop */}
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

              <div>
                <SectionTitle color="bg-teal-500">Air Quality</SectionTitle>
                <AQIPanel />
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
                  <RainChart hours={hours} />
                </div>
                <div className="lg:col-span-2">
                  <DailyRainChart />
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      <footer className="border-t border-slate-700/60 py-3 text-center text-xs text-slate-500">
        Ecowitt GW1100B via Home Assistant
      </footer>
    </div>
  );
}
