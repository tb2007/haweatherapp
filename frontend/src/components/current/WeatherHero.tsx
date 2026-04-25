import { useCurrentWeather, val, numVal, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';
import { StatCard } from './StatCard';
import { WindCompass } from './WindCompass';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function uvColor(uv: number | null) {
  if (uv == null) return 'text-slate-400';
  if (uv <= 2) return 'text-green-400';
  if (uv <= 5) return 'text-yellow-400';
  if (uv <= 7) return 'text-orange-400';
  if (uv <= 10) return 'text-red-400';
  return 'text-purple-400';
}

export function WeatherHero() {
  const { data, isLoading } = useCurrentWeather();

  if (isLoading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  const temp = numVal(data, ENTITIES.temperature);
  const windchill = numVal(data, ENTITIES.windchill);
  const uv = numVal(data, ENTITIES.uvIndex);
  const windDeg = numVal(data, ENTITIES.windDirection);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Current Conditions
      </h2>

      {/* Temperature hero */}
      <div className="mb-4 rounded-xl bg-gradient-to-br from-sky-900/60 to-slate-800 p-6 shadow-lg">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="text-6xl font-extrabold text-sky-300">
              {temp != null ? temp.toFixed(1) : '—'}
              <span className="ml-1 text-2xl font-normal text-slate-400">
                {unit(data, ENTITIES.temperature)}
              </span>
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Feels like {windchill != null ? `${windchill.toFixed(1)} ${unit(data, ENTITIES.windchill)}` : '—'}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span>Pressure: <strong className="text-slate-100">{val(data, ENTITIES.pressure)} {unit(data, ENTITIES.pressure)}</strong></span>
            <span>Solar: <strong className="text-slate-100">{val(data, ENTITIES.solarRadiation)} W/m²</strong></span>
            <span>Lux: <strong className="text-slate-100">{val(data, ENTITIES.solarLux)}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid of stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <WindCompass
          degrees={windDeg}
          speed={val(data, ENTITIES.windSpeed)}
          gust={val(data, ENTITIES.windGust)}
          unit={unit(data, ENTITIES.windSpeed)}
        />
        <StatCard
          label="UV Index"
          value={uv}
          accent={uvColor(uv)}
          sub={uv == null ? '' : uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : uv <= 7 ? 'High' : uv <= 10 ? 'Very High' : 'Extreme'}
        />
        <StatCard
          label="Solar Radiation"
          value={val(data, ENTITIES.solarRadiation)}
          unit="W/m²"
          accent="text-yellow-400"
        />
        <StatCard
          label="Pressure"
          value={val(data, ENTITIES.pressure)}
          unit={unit(data, ENTITIES.pressure)}
          accent="text-indigo-400"
        />
        <StatCard
          label="Water Shutoff Temp"
          value={val(data, ENTITIES.waterShutoffTemp)}
          unit={unit(data, ENTITIES.waterShutoffTemp)}
          accent="text-teal-400"
        />
      </div>
    </section>
  );
}
