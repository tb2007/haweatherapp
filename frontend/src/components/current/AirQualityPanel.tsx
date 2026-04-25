import { useCurrentWeather, val, numVal, unit } from '../../hooks/useCurrentWeather';
import { ENTITIES } from '../../constants/entities';
import { StatCard } from './StatCard';

function co2Color(ppm: number | null) {
  if (ppm == null) return 'text-slate-400';
  if (ppm < 800) return 'text-green-400';
  if (ppm < 1200) return 'text-yellow-400';
  if (ppm < 2000) return 'text-orange-400';
  return 'text-red-400';
}

function pmColor(val: number | null, thresholds: [number, number, number]) {
  if (val == null) return 'text-slate-400';
  if (val < thresholds[0]) return 'text-green-400';
  if (val < thresholds[1]) return 'text-yellow-400';
  if (val < thresholds[2]) return 'text-orange-400';
  return 'text-red-400';
}

export function AirQualityPanel() {
  const { data } = useCurrentWeather();
  const co2 = numVal(data, ENTITIES.co2);
  const pm25 = numVal(data, ENTITIES.pm25);
  const pm10 = numVal(data, ENTITIES.pm10);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Air Quality
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="CO₂" value={co2} unit="ppm" accent={co2Color(co2)} sub={val(data, ENTITIES.co2_24h) !== '—' ? `24h avg: ${val(data, ENTITIES.co2_24h)} ppm` : undefined} />
        <StatCard label="PM2.5" value={pm25} unit="µg/m³" accent={pmColor(pm25, [12, 35, 55])} sub={val(data, ENTITIES.pm25_24h) !== '—' ? `24h avg: ${val(data, ENTITIES.pm25_24h)}` : undefined} />
        <StatCard label="PM10" value={pm10} unit="µg/m³" accent={pmColor(pm10, [54, 154, 254])} sub={val(data, ENTITIES.pm10_24h) !== '—' ? `24h avg: ${val(data, ENTITIES.pm10_24h)}` : undefined} />
        <StatCard label="Indoor Temp" value={val(data, ENTITIES.aqTemp)} unit={unit(data, ENTITIES.aqTemp)} accent="text-rose-400" />
        <StatCard label="Indoor Humidity" value={val(data, ENTITIES.aqHumidity)} unit={unit(data, ENTITIES.aqHumidity)} accent="text-cyan-400" />
      </div>
    </section>
  );
}
