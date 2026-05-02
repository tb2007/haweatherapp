import { useQuery } from '@tanstack/react-query';

export interface ForecastHour {
  time: string;
  temp: number;
  feelsLike: number;
  weatherCode: number;
  windSpeed: number;
}

export interface SunTimes {
  sunrise: string; // ISO datetime string
  sunset: string;
}

interface ForecastResult {
  hours: ForecastHour[];
  sunTimes: SunTimes | null;
}

async function fetchForecast(): Promise<ForecastResult> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=39.690&longitude=-105.124' +
    '&hourly=temperature_2m,weather_code,windspeed_10m,apparent_temperature' +
    '&daily=sunrise,sunset' +
    '&temperature_unit=fahrenheit&wind_speed_unit=mph' +
    '&timezone=America%2FDenver&forecast_days=2';

  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast fetch failed');
  const json = await res.json();

  const { time, temperature_2m, weather_code, windspeed_10m, apparent_temperature } = json.hourly;
  const now = Date.now();

  const hours = (time as string[])
    .map((t: string, i: number) => ({
      time: t,
      temp: temperature_2m[i],
      feelsLike: apparent_temperature[i],
      weatherCode: weather_code[i],
      windSpeed: windspeed_10m[i],
    }))
    .filter((h) => new Date(h.time).getTime() >= now)
    .slice(0, 24);

  const sunTimes: SunTimes | null = json.daily?.sunrise?.[0]
    ? { sunrise: json.daily.sunrise[0], sunset: json.daily.sunset[0] }
    : null;

  return { hours, sunTimes };
}

export function useForecast() {
  return useQuery({
    queryKey: ['hourly-forecast-v2'],
    queryFn: fetchForecast,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}
