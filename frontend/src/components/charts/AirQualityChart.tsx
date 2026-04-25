import { ChartContainer } from './ChartContainer';
import { BaseChart } from './BaseChart';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { ENTITIES } from '../../constants/entities';
import { LoadingSpinner } from '../ui/LoadingSpinner';

function CO2Inner({ hours }: { hours: number }) {
  const co2 = useHistoricalData(ENTITIES.co2, hours);
  if (co2.isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;
  return (
    <BaseChart
      series={[{ key: 'co2', label: 'CO₂', color: '#fb923c', data: co2.data ?? [] }]}
      unit="ppm"
    />
  );
}

function PMInner({ hours }: { hours: number }) {
  const pm25 = useHistoricalData(ENTITIES.pm25, hours);
  const pm10 = useHistoricalData(ENTITIES.pm10, hours);
  if (pm25.isLoading) return <div className="flex h-40 justify-center items-center"><LoadingSpinner /></div>;
  return (
    <BaseChart
      series={[
        { key: 'pm25', label: 'PM2.5', color: '#f43f5e', data: pm25.data ?? [] },
        { key: 'pm10', label: 'PM10', color: '#e879f9', data: pm10.data ?? [] },
      ]}
      unit="µg/m³"
      yDomain={[0, 'auto']}
    />
  );
}

export function CO2Chart() {
  return (
    <ChartContainer title="CO₂">
      {(hours) => <CO2Inner hours={hours} />}
    </ChartContainer>
  );
}

export function PMChart() {
  return (
    <ChartContainer title="Particulates (PM2.5 / PM10)">
      {(hours) => <PMInner hours={hours} />}
    </ChartContainer>
  );
}
