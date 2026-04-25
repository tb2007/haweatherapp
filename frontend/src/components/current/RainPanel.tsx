import { useCurrentWeather, val, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';
import { StatCard } from './StatCard';

export function RainPanel() {
  const { data } = useCurrentWeather();

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Rainfall
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total Rain" value={val(data, ENTITIES.totalRain)} unit={unit(data, ENTITIES.totalRain)} accent="text-blue-400" />
        <StatCard label="Weekly Rain" value={val(data, ENTITIES.weeklyRain)} unit={unit(data, ENTITIES.weeklyRain)} accent="text-blue-400" />
        <StatCard label="Yearly Rain" value={val(data, ENTITIES.yearlyRain)} unit={unit(data, ENTITIES.yearlyRain)} accent="text-blue-400" />
      </div>
    </section>
  );
}
