import { useState } from 'react';
import { useForecast } from '../../hooks/useForecast';
import { LoadingSpinner } from '../ui/LoadingSpinner';

type ForecastView = '24h' | '7d';

function wmoIcon(code: number, hour: number): string {
  const isNight = hour < 6 || hour >= 20;
  if (code === 0)   return isNight ? '🌙' : '☀️';
  if (code === 1)   return isNight ? '🌙' : '🌤️';
  if (code === 2)   return '⛅';
  if (code === 3)   return '☁️';
  if (code <= 48)   return '🌫️';
  if (code <= 55)   return '🌦️';
  if (code <= 65)   return '🌧️';
  if (code <= 77)   return '🌨️';
  if (code <= 82)   return '🌧️';
  if (code <= 86)   return '🌨️';
  return '⛈️';
}

function wmoLabel(code: number): string {
  if (code === 0)   return 'Clear';
  if (code === 1)   return 'Mostly Clear';
  if (code === 2)   return 'Partly Cloudy';
  if (code === 3)   return 'Overcast';
  if (code <= 48)   return 'Fog';
  if (code <= 55)   return 'Drizzle';
  if (code <= 65)   return 'Rain';
  if (code <= 77)   return 'Snow';
  if (code <= 82)   return 'Showers';
  if (code <= 86)   return 'Snow Showers';
  return 'Thunderstorm';
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
            const h = new Date(hour.time).getHours();
            const showPrecip = hour.precipProb > 0;
            return (
              <div
                key={hour.time}
                className="flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-lg bg-slate-700/60 px-3 py-3 text-center"
              >
                <span className="text-xs font-medium text-slate-400">{fmtHour(hour.time)}</span>
                <span className="text-2xl leading-none">{wmoIcon(hour.weatherCode, h)}</span>
                <span className="text-[10px] leading-tight text-slate-400">{wmoLabel(hour.weatherCode)}</span>
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
              <span className="text-2xl leading-none">{wmoIcon(day.weatherCode, 12)}</span>
              <span className="text-[10px] leading-tight text-slate-400">{wmoLabel(day.weatherCode)}</span>
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
