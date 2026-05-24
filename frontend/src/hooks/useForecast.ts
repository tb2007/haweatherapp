import { useQuery } from '@tanstack/react-query';

export interface ForecastHour {
  time: string;
  temp: number;
  feelsLike: number;
  weatherCode: number;
  windSpeed: number;
  precipProb: number;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  weatherCode: number;
  precipProb: number;
  maxWind: number;
}

export interface SunTimes {
  sunrise: string;
  sunset: string;
}

interface ForecastResult {
  hours: ForecastHour[];
  days: ForecastDay[];
  sunTimes: SunTimes | null;
}

async function fetchForecast(): Promise<ForecastResult> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=39.690&longitude=-105.124' +
    '&hourly=temperature_2m,weather_code,windspeed_10m,apparent_temperature,precipitation_probability' +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,windspeed_10m_max,sunrise,sunset' +
    '&temperature_unit=fahrenheit&wind_speed_unit=mph' +
    '&timezone=America%2FDenver&forecast_days=7';

  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast fetch failed');
  const json = await res.json();

  const { time, temperature_2m, weather_code, windspeed_10m, apparent_temperature, precipitation_probability } = json.hourly;
  const now = Date.now();

  const hours = (time as string[])
    .map((t: string, i: number) => ({
      time: t,
      temp: temperature_2m[i],
      feelsLike: apparent_temperature[i],
      weatherCode: weather_code[i],
      windSpeed: windspeed_10m[i],
      precipProb: precipitation_probability[i] ?? 0,
    }))
    .filter((h) => new Date(h.time).getTime() >= now)
    .slice(0, 24);

  const daily = json.daily;
  const days: ForecastDay[] = (daily.time as string[]).map((date: string, i: number) => ({
    date,
    high: Math.round(daily.temperature_2m_max[i]),
    low: Math.round(daily.temperature_2m_min[i]),
    weatherCode: daily.weather_code[i],
    precipProb: daily.precipitation_probability_max[i] ?? 0,
    maxWind: Math.round(daily.windspeed_10m_max[i]),
  }));

  const sunTimes: SunTimes | null = daily?.sunrise?.[0]
    ? { sunrise: daily.sunrise[0], sunset: daily.sunset[0] }
    : null;

  return { hours, days, sunTimes };
}

export function useForecast() {
  return useQuery({
    queryKey: ['hourly-forecast-v4'],
    queryFn: fetchForecast,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}
