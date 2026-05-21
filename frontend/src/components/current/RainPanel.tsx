import { useCurrentWeather, val, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';
import { StatCard } from './StatCard';

export function RainPanel() {
  const { data } = useCurrentWeather();

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Rain Event" value={val(data, ENTITIES.eventRain)} unit={unit(data, ENTITIES.eventRain)} accent="text-blue-400" />
        <StatCard label="Weekly Rain" value={val(data, ENTITIES.weeklyRain)} unit={unit(data, ENTITIES.weeklyRain)} accent="text-blue-400" />
        <StatCard label="Yearly Rain" value={val(data, ENTITIES.yearlyRain)} unit={unit(data, ENTITIES.yearlyRain)} accent="text-blue-400" />
      </div>
    </section>
  );
}
