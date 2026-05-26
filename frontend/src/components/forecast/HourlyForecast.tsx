import { useState } from 'react';
import { useForecast } from '../../hooks/useForecast';
import { LoadingSpinner } from '../ui/LoadingSpinner';

type ForecastView = 'daypart' | '7d';

// WU icon codes 0-47
function wuIcon(code: number, hour = 12): string {
  const isNight = hour < 6 || hour >= 20;
  if (code === 31 || code === 33) return '🌙';          // clear / fair night
  if (code === 32 || code === 34 || code === 36) return isNight ? '🌙' : '☀️';
  if (code === 30) return isNight ? '🌙' : '⛅';        // partly cloudy day
  if (code === 29) return '🌙';                          // partly cloudy night
  if (code === 28) return '🌤️';                         // mostly cloudy day
  if (code === 27) return '🌙';                          // mostly cloudy night
  if (code === 26) return '☁️';                          // cloudy
  if (code === 0 || code === 1 || code === 2) return '🌀'; // severe
  if (code === 3 || code === 4 || code === 37 || code === 38 || code === 47) return '⛈️';
  if (code === 9 || code === 11 || code === 39 || code === 45) return '🌦️';
  if (code === 12 || code === 40 || code === 35) return '🌧️';
  if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 17 || code === 18) return '🌨️';
  if (code === 13 || code === 14 || code === 15 || code === 16 || code === 41 || code === 42 || code === 43 || code === 46) return '🌨️';
  if (code === 19 || code === 20 || code === 21 || code === 22) return '🌫️';
  if (code === 23 || code === 24) return '💨';
  if (code === 25) return '❄️';
  return '🌡️';
}

function wuLabel(code: number): string {
  if (code === 0) return 'Tornado';
  if (code === 1) return 'Tropical Storm';
  if (code === 2) return 'Hurricane';
  if (code === 3 || code === 4) return 'Thunderstorm';
  if (code === 5) return 'Rain/Snow Mix';
  if (code === 6 || code === 18) return 'Sleet';
  if (code === 7) return 'Wintry Mix';
  if (code === 8) return 'Freezing Drizzle';
  if (code === 9) return 'Drizzle';
  if (code === 10) return 'Freezing Rain';
  if (code === 11) return 'Light Rain';
  if (code === 12) return 'Rain';
  if (code === 13) return 'Flurries';
  if (code === 14) return 'Snow Showers';
  if (code === 15) return 'Blowing Snow';
  if (code === 16) return 'Snow';
  if (code === 17) return 'Hail';
  if (code === 19) return 'Dust';
  if (code === 20) return 'Foggy';
  if (code === 21) return 'Haze';
  if (code === 22) return 'Smoke';
  if (code === 23) return 'Breezy';
  if (code === 24) return 'Windy';
  if (code === 25) return 'Frigid';
  if (code === 26) return 'Cloudy';
  if (code === 27 || code === 28) return 'Mostly Cloudy';
  if (code === 29 || code === 30) return 'Partly Cloudy';
  if (code === 31 || code === 33) return 'Clear';
  if (code === 32 || code === 34) return 'Sunny';
  if (code === 35) return 'Rain/Hail';
  if (code === 36) return 'Hot';
  if (code === 37 || code === 38 || code === 47) return 'Thunderstorm';
  if (code === 39 || code === 45) return 'Showers';
  if (code === 40) return 'Heavy Rain';
  if (code === 41 || code === 46) return 'Snow Showers';
  if (code === 42) return 'Heavy Snow';
  if (code === 43) return 'Blizzard';
  return '';
}

function fmtHour(timeStr: string): string {
  const d = new Date(timeStr);
  const h = d.getHours();
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function fmtDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString([], { weekday: 'short' });
}

export function HourlyForecast() {
  const { data, isLoading, isError } = useForecast();
  const [view, setView] = useState<ForecastView>('daypart');

  if (isLoading) return <div className="flex justify-center py-6"><LoadingSpinner /></div>;
  if (isError || !data) return null;

  return (
    <div className="rounded-xl bg-slate-800/60 p-4">
      {/* Header + toggle */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Lakewood, CO · Weather Underground</span>
        <div className="flex gap-1">
          {([['daypart', '24h'], ['7d', '5 Day']] as [ForecastView, string][]).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
                view === v ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>

          {view === 'daypart' && data.hours.map((hour) => {
            const h = new Date(hour.time).getHours();
            const showPrecip = hour.precipProb > 0;
            return (
              <div
                key={hour.time}
                className="flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-lg bg-slate-700/60 px-3 py-3 text-center"
              >
                <span className="text-xs font-medium text-slate-400">{fmtHour(hour.time)}</span>
                <span className="text-2xl leading-none">{wuIcon(hour.weatherCode, h)}</span>
                <span className="text-[10px] leading-tight text-slate-400">{wuLabel(hour.weatherCode)}</span>
                <span className="text-sm font-bold text-sky-300">{Math.round(hour.temp)}°</span>
                <span className="text-xs text-slate-500">{Math.round(hour.windSpeed)} mph</span>
                {showPrecip
                  ? <span className="text-[10px] font-medium text-blue-400">💧 {hour.precipProb}%</span>
                  : <span className="text-[10px] text-slate-600">—</span>
                }
              </div>
            );
          })}

          {view === '7d' && data.days.map((day) => (
            <div
              key={day.date}
              className="flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-lg bg-slate-700/60 px-3 py-3 text-center"
            >
              <span className="text-xs font-medium text-slate-400">{fmtDay(day.date)}</span>
              <span className="text-2xl leading-none">{wuIcon(day.weatherCode)}</span>
              <span className="text-[10px] leading-tight text-slate-400">{wuLabel(day.weatherCode)}</span>
              <div className="flex gap-1 text-sm font-bold">
                <span className="text-sky-300">{day.high ?? '—'}°</span>
                <span className="text-slate-500">{day.low ?? '—'}°</span>
              </div>
              <span className="text-xs text-slate-500">{day.maxWind} mph</span>
              {day.precipProb > 0
                ? <span className="text-[10px] font-medium text-blue-400">💧 {day.precipProb}%</span>
                : <span className="text-[10px] text-slate-600">—</span>
              }
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
