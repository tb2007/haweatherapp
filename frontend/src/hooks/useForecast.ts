import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface ForecastHour {
  time: string;
  temp: number;
  feelsLike: number;
  weatherCode: number; // Weather Underground icon code 0–47
  windSpeed: number;
  precipProb: number;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  weatherCode: number; // Weather Underground icon code 0–47
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

export function useForecast() {
  return useQuery<ForecastResult>({
    queryKey: ['forecast-wu-v1'],
    queryFn: () => api.forecast().then((r) => r.data),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}
