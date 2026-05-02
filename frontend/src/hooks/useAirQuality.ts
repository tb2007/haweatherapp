import { useQuery } from '@tanstack/react-query';

export interface AirQuality {
  aqi: number;
  pm25: number;
}

function aqiLabel(aqi: number): { label: string; color: string; bg: string } {
  if (aqi <= 50)  return { label: 'Good',                        color: 'text-green-400',  bg: 'bg-green-900/40' };
  if (aqi <= 100) return { label: 'Moderate',                    color: 'text-yellow-400', bg: 'bg-yellow-900/40' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive',     color: 'text-orange-400', bg: 'bg-orange-900/40' };
  if (aqi <= 200) return { label: 'Unhealthy',                   color: 'text-red-400',    bg: 'bg-red-900/40' };
  if (aqi <= 300) return { label: 'Very Unhealthy',              color: 'text-purple-400', bg: 'bg-purple-900/40' };
  return                  { label: 'Hazardous',                  color: 'text-rose-300',   bg: 'bg-rose-900/40' };
}

async function fetchAirQuality(): Promise<AirQuality> {
  const url =
    'https://air-quality-api.open-meteo.com/v1/air-quality' +
    '?latitude=39.690&longitude=-105.124' +
    '&current=us_aqi,pm2_5' +
    '&timezone=America%2FDenver';

  const res = await fetch(url);
  if (!res.ok) throw new Error('AQI fetch failed');
  const json = await res.json();
  return {
    aqi: Math.round(json.current.us_aqi ?? 0),
    pm25: parseFloat((json.current.pm2_5 ?? 0).toFixed(1)),
  };
}

export { aqiLabel };
export function useAirQuality() {
  return useQuery({
    queryKey: ['air-quality'],
    queryFn: fetchAirQuality,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}
