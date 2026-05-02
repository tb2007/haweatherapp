import { useQuery } from '@tanstack/react-query';

export interface NWSAlert {
  id: string;
  event: string;
  headline: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  expires: string;
}

async function fetchAlerts(): Promise<NWSAlert[]> {
  const res = await fetch('https://api.weather.gov/alerts/active?point=39.690,-105.124', {
    headers: { 'User-Agent': 'haweatherapp/1.0' },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.features ?? []).map((f: any) => ({
    id: f.id,
    event: f.properties.event,
    headline: f.properties.headline,
    severity: f.properties.severity,
    expires: f.properties.expires,
  }));
}

export function useNWSAlerts() {
  return useQuery({
    queryKey: ['nws-alerts'],
    queryFn: fetchAlerts,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
