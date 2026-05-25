import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface ForecastHour {
  time: string;
  temp: number;
  feelsLike: number;
  weatherCode: number; // WU icon code 0–47
  windSpeed: number;
  precipProb: number;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  weatherCode: number; // WU icon code 0–47
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
  // Key comes from the backend so it never lives in frontend source
  const { data: { apiKey } } = await api.wuKey();

  const geo = '39.690,-105.124';
  const params = `geocode=${geo}&format=json&units=e&language=en-US&apiKey=${apiKey}`;
  const base = 'https://api.weather.com/v3/wx/forecast';

  const [hourlyRes, dailyRes] = await Promise.all([
    fetch(`${base}/hourly/1day?${params}`).then((r) => r.json()),
    fetch(`${base}/daily/5day?${params}`).then((r) => r.json()),
  ]);

  const h = hourlyRes;
  const now = Date.now();

  const hours = (h.validTimeLocal ?? [])
    .map((t: string, i: number) => ({
      time: t,
      temp: h.temperature?.[i] ?? 0,
      feelsLike: h.temperatureFeelsLike?.[i] ?? h.temperature?.[i] ?? 0,
      weatherCode: h.iconCode?.[i] ?? 32,
      windSpeed: h.windSpeed?.[i] ?? 0,
      precipProb: h.precipChance?.[i] ?? 0,
    }))
    .filter((hr: ForecastHour) => new Date(hr.time).getTime() >= now);

  const d = dailyRes;
  const dp = d.daypart?.[0] ?? {};

  const days = (d.validTimeLocal ?? []).map((t: string, i: number) => ({
    date: t.split('T')[0],
    high: d.calendarDayTemperatureMax?.[i] ?? 0,
    low: d.calendarDayTemperatureMin?.[i] ?? 0,
    weatherCode: dp.iconCode?.[i * 2] ?? dp.iconCode?.[i * 2 + 1] ?? 32,
    precipProb: dp.precipChance?.[i * 2] ?? dp.precipChance?.[i * 2 + 1] ?? 0,
    maxWind: dp.windSpeed?.[i * 2] ?? dp.windSpeed?.[i * 2 + 1] ?? 0,
  }));

  let sunTimes: SunTimes | null = null;
  if (d.sunriseTimeLocal?.[0] && d.sunsetTimeLocal?.[0]) {
    sunTimes = {
      sunrise: new Date(d.sunriseTimeLocal[0]).toISOString(),
      sunset: new Date(d.sunsetTimeLocal[0]).toISOString(),
    };
  }

  return { hours, days, sunTimes };
}

export function useForecast() {
  return useQuery<ForecastResult>({
    queryKey: ['forecast-wu-v3'],
    queryFn: fetchForecast,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}
