import { useQuery } from '@tanstack/react-query';

export interface ForecastHour {
  time: string;
  temp: number;
  feelsLike: number;
  weatherCode: number; // WU icon code 0-47
  windSpeed: number;
  precipProb: number;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  weatherCode: number; // WU icon code 0-47
  precipProb: number;
  maxWind: number;
}

export interface SunTimes {
  sunrise: string;
  sunset: string;
}

export interface ForecastResult {
  hours: ForecastHour[];
  days: ForecastDay[];
  sunTimes: SunTimes | null;
}

async function fetchForecast(): Promise<ForecastResult> {
  const res = await fetch('/api/weather/forecast');
  if (!res.ok) throw new Error('Forecast fetch failed');
  return res.json();
}

export function useForecast() {
  return useQuery<ForecastResult>({
    queryKey: ['forecast-wu-v3'],
    queryFn: fetchForecast,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}
