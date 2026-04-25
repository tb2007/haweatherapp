import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const ZONES = [
  { key: 'z1', label: 'Zone 1', id: ENTITIES.soilMoisture1, color: '#4ade80' },
  { key: 'z3', label: 'Zone 3', id: ENTITIES.soilMoisture3, color: '#a3e635' },
  { key: 'z4', label: 'Zone 4', id: ENTITIES.soilMoisture4, color: '#facc15' },
  { key: 'z5', label: 'Zone 5', id: ENTITIES.soilMoisture5, color: '#fb923c' },
  { key: 'z6', label: 'Zone 6', id: ENTITIES.soilMoisture6, color: '#f87171' },
];

function Inner({ hours }: { hours: number }) {
  const z1 = useHistoricalData(ZONES[0].id, hours);
  const z3 = useHistoricalData(ZONES[1].id, hours);
  const z4 = useHistoricalData(ZONES[2].id, hours);
  const z5 = useHistoricalData(ZONES[3].id, hours);
  const z6 = useHistoricalData(ZONES[4].id, hours);
  const all = [z1, z3, z4, z5, z6];
  if (all.some((q) => q.isLoading)) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;
  return (
    <BaseChart
      series={ZONES.map((z, i) => ({ key: z.key, label: z.label, color: z.color, data: all[i].data ?? [] }))}
      unit="%"
      yDomain={[0, 100]}
    />
  );
}

export function SoilChart() {
  return (
    <ChartContainer title="Soil Moisture">
      {(hours) => <Inner hours={hours} />}
    </ChartContainer>
  );
}
