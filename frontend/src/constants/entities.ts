export const ENTITIES = {
  // Atmosphere
  temperature: 'sensor.gw1100b_v2_0_4_outdoor_temperature',
  pressure: 'sensor.gw1100b_v2_0_4_relative_pressure',
  uvIndex: 'sensor.gw1100b_v2_0_4_uv_index',
  solarRadiation: 'sensor.gw1100b_v2_0_4_solar_radiation',
  solarLux: 'sensor.gw1100b_v2_0_4_solar_lux',

  // Wind
  windSpeed: 'sensor.gw1100b_v2_0_4_wind_speed',
  windGust: 'sensor.gw1100b_v2_0_4_wind_gust',
  windDirection: 'sensor.gw1100b_v2_0_4_wind_direction',

  // Rain
  totalRain: 'sensor.gw1100b_v2_0_4_total_rain',
  weeklyRain: 'sensor.gw1100b_v2_0_4_weekly_rain_rate',
  yearlyRain: 'sensor.gw1100b_v2_0_4_yearly_rain_rate',

  // Indoor (WH45 sensor)
  aqHumidity: 'sensor.gw1100b_wh45_humidity',
} as const;

export const CURRENT_ENTITY_IDS = Object.values(ENTITIES).join(',');

export const POLL_INTERVAL_MS = 30_000;
export const HISTORY_REFRESH_MS = 5 * 60_000;
