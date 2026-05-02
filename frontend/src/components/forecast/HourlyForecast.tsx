import { useForecast } from '../../hooks/useForecast';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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

export function HourlyForecast() {
  const { data, isLoading, isError } = useForecast();

  if (isLoading) return <div className="flex justify-center py-6"><LoadingSpinner /></div>;
  if (isError || !data) return null;

  const hours = data.hours;

  return (
    <div className="rounded-xl bg-slate-800/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Lakewood, CO</span>
      </div>
      {/* overflow with negative margin to create peek effect on mobile */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
          {hours.map((hour) => {
            const h = new Date(hour.time).getHours();
            return (
              <div
                key={hour.time}
                className="flex flex-col items-center gap-1 rounded-lg bg-slate-700/60 px-3 py-3 text-center w-[72px] shrink-0"
              >
                <span className="text-xs font-medium text-slate-400">{fmtHour(hour.time)}</span>
                <span className="text-2xl leading-none">{wmoIcon(hour.weatherCode, h)}</span>
                <span className="text-[10px] leading-tight text-slate-400 text-center">{wmoLabel(hour.weatherCode)}</span>
                <span className="text-sm font-bold text-sky-300">{Math.round(hour.temp)}°</span>
                <span className="text-xs text-slate-500">{Math.round(hour.windSpeed)} mph</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
