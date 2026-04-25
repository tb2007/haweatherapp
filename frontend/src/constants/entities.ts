export const ENTITIES = {
  // Atmosphere
  temperature: 'sensor.gw1100b_v2_0_4_temperature_1',
  windchill: 'sensor.gw1100b_v2_0_4_windchill',
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

  // Air quality (WH45 sensor)
  co2: 'sensor.gw1100b_wh45_co2',
  co2_24h: 'sensor.gw1100b_wh45_co2_24h_average',
  pm25: 'sensor.gw1100b_wh45_pm2_5_co2',
  pm25_24h: 'sensor.gw1100b_wh45_pm2_5_co2_24h_average',
  pm10: 'sensor.gw1100b_wh45_pm10_co2',
  pm10_24h: 'sensor.gw1100b_wh45_pm10_co2_24h_average',
  aqTemp: 'sensor.gw1100b_wh45_temperature',
  aqHumidity: 'sensor.gw1100b_wh45_humidity',

  // Soil moisture
  soilMoisture1: 'sensor.gw1100b_v2_0_4_soil_moisture_1',
  soilMoisture3: 'sensor.gw1100b_v2_0_4_soil_moisture_3',
  soilMoisture4: 'sensor.gw1100b_soil_moisture_4',
  soilMoisture5: 'sensor.gw1100b_soil_moisture_5',
  soilMoisture6: 'sensor.gw1100b_soil_moisture_6',

  // Misc
  waterShutoffTemp: 'sensor.gw1100b_temperature_2',
} as const;

export const CURRENT_ENTITY_IDS = Object.values(ENTITIES).join(',');

export const POLL_INTERVAL_MS = 30_000;
export const HISTORY_REFRESH_MS = 5 * 60_000;
