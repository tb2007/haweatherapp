import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function Inner({ hours }: { hours: number }) {
  const temp = useHistoricalData(ENTITIES.temperature, hours);
  const windchill = useHistoricalData(ENTITIES.windchill, hours);
  if (temp.isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;
  return (
    <BaseChart
      series={[
        { key: 'temp', label: 'Temperature', color: '#f97316', data: temp.data ?? [] },
        { key: 'windchill', label: 'Windchill', color: '#60a5fa', data: windchill.data ?? [] },
      ]}
      unit="°"
    />
  );
}

export function TemperatureChart() {
  return (
    <ChartContainer title="Temperature">
      {(hours) => <Inner hours={hours} />}
    </ChartContainer>
  );
}
