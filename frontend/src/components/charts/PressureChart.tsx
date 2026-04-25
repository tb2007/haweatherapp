import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function Inner({ hours }: { hours: number }) {
  const { data, isLoading } = useHistoricalData(ENTITIES.pressure, hours);
  if (isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;
  return (
    <BaseChart
      series={[{ key: 'pressure', label: 'Pressure', color: '#a78bfa', data: data ?? [] }]}
      unit="hPa"
    />
  );
}

export function PressureChart() {
  return (
    <ChartContainer title="Relative Pressure">
      {(hours) => <Inner hours={hours} />}
    </ChartContainer>
  );
}
