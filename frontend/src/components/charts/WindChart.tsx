import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function Inner({ hours }: { hours: number }) {
  const speed = useHistoricalData(ENTITIES.windSpeed, hours);
  const gust = useHistoricalData(ENTITIES.windGust, hours);
  if (speed.isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;
  return (
    <BaseChart
      series={[
        { key: 'speed', label: 'Wind Speed', color: '#34d399', data: speed.data ?? [] },
        { key: 'gust', label: 'Gust', color: '#fbbf24', data: gust.data ?? [] },
      ]}
      unit="km/h"
      yDomain={[0, 'auto']}
    />
  );
}

export function WindChart() {
  return (
    <ChartContainer title="Wind Speed & Gust">
      {(hours) => <Inner hours={hours} />}
    </ChartContainer>
  );
}
