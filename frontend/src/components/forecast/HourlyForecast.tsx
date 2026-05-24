import { useState } from 'react';
import { useForecast } from '../../hooks/useForecast';
import { LoadingSpinner } from '../ui/LoadingSpinner';

type ForecastView = '24h' | '7d';

// Weather Underground icon codes 0–47
function wuIcon(code: number): string {
  if (code <= 4)  return '⛈️';  // tornado, tropical storm, thunderstorm
  if (code <= 8)  return '🌨️';  // wintry mix, freezing precip
  if (code === 9) return '🌦️';  // drizzle
  if (code <= 12) return '🌧️';  // rain
  if (code <= 18) return '🌨️';  // snow, sleet, hail
  if (code <= 22) return '🌫️';  // fog, haze, smoke
  if (code <= 24) return '💨';   // breezy, windy
  if (code === 25) return '❄️';  // frigid
  if (code === 26) return '☁️';  // cloudy
  if (code === 27) return '☁️';  // mostly cloudy (night)
  if (code === 28) return '⛅';  // mostly cloudy (day)
  if (code === 29) return '🌙';  // partly cloudy (night)
  if (code === 30) return '🌤️'; // partly cloudy (day)
  if (code === 31) return '🌙';  // clear (night)
  if (code === 32) return '☀️';  // sunny
  if (code === 33) return '🌙';  // fair (night)
  if (code === 34) return '🌤️'; // fair (day)
  if (code === 35) return '🌧️'; // rain/hail
  if (code === 36) return '☀️';  // hot
  if (code <= 39) return '⛈️';  // thunderstorm
  if (code === 40) return '🌦️'; // scattered showers
  if (code <= 43) return '🌨️';  // snow
  if (code === 44) return '⛅';  // partly cloudy
  if (code <= 47) return '⛈️';  // thundershower
  return '🌡️';
}

function wuLabel(code: number): string {
  if (code <= 2)  return 'Severe Storm';
  if (code <= 4)  return 'Thunderstorm';
  if (code <= 8)  return 'Wintry Mix';
  if (code === 9) return 'Drizzle';
  if (code <= 12) return 'Rain';
  if (code <= 18) return 'Snow';
  if (code <= 22) return 'Fog';
  if (code <= 24) return 'Windy';
  if (code === 25) return 'Frigid';
  if (code === 26) return 'Cloudy';
  if (code <= 28) return 'Mostly Cloudy';
  if (code <= 30) return 'Partly Cloudy';
  if (code === 31) return 'Clear';
  if (code === 32) return 'Sunny';
  if (code <= 34) return 'Fair';
  if (code === 36) return 'Hot';
  if (code <= 39) return 'Thunderstorm';
  if (code === 40) return 'Showers';
  if (code <= 43) return 'Snow';
  if (code === 44) return 'Partly Cloudy';
  if (code <= 47) return 'Thunderstorm';
  return 'Unknown';
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
  const [view, setView] = useState<ForecastView>('24h');

  if (isLoading) return <div className="flex justify-center py-6"><LoadingSpinner /></div>;
  if (isError || !data) return null;

  return (
    <div className="rounded-xl bg-slate-800/60 p-4">
      {/* Header + toggle */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Lakewood, CO</span>
        <div className="flex gap-1">
          {(['24h', '7d'] as ForecastView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded px-2.5 py-0.5 text-xs font-medium transition-colors ${
                view === v ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>

          {view === '24h' && data.hours.map((hour) => {
            const showPrecip = hour.precipProb > 0;
            return (
              <div
                key={hour.time}
                className="flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-lg bg-slate-700/60 px-3 py-3 text-center"
              >
                <span className="text-xs font-medium text-slate-400">{fmtHour(hour.time)}</span>
                <span className="text-2xl leading-none">{wuIcon(hour.weatherCode)}</span>
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
                <span className="text-sky-300">{day.high}°</span>
                <span className="text-slate-500">{day.low}°</span>
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
