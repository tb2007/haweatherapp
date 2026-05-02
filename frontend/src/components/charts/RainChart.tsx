import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function Inner({ hours }: { hours: number }) {
  const { data, isLoading } = useHistoricalData(ENTITIES.totalRain, hours);
  if (isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;
  return (
    <BaseChart
      series={[{ key: 'rain', label: 'Total Rain', color: '#38bdf8', data: data ?? [] }]}
      unit="mm"
      yDomain={[0, 'auto']}
    />
  );
}

export function RainChart({ hours }: { hours: number }) {
  return (
    <ChartContainer title="Rainfall" hours={hours}>
      {(h) => <Inner hours={h} />}
    </ChartContainer>
  );
}
