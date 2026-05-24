import { Router } from 'express';
import axios from 'axios';

const router = Router();

const ha = () => axios.create({
  baseURL: process.env.HA_BASE_URL,
  headers: { Authorization: `Bearer ${process.env.HA_TOKEN}` },
  timeout: 10000,
});

// Current state for one or many entities
// GET /api/weather/states?ids=sensor.foo,sensor.bar
router.get('/states', async (req, res) => {
  try {
    const ids = req.query.ids?.split(',').filter(Boolean);
    if (!ids?.length) return res.status(400).json({ error: 'ids required' });

    const results = await Promise.allSettled(
      ids.map((id) => ha().get(`/api/states/${id}`))
    );

    const states = {};
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        states[ids[i]] = result.value.data;
      } else {
        states[ids[i]] = { error: 'unavailable' };
      }
    });

    res.json(states);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Home Assistant' });
  }
});

// Historical data for a single entity
// GET /api/weather/history/:entityId?hours=24
router.get('/history/:entityId', async (req, res) => {
  try {
    const { entityId } = req.params;
    const hours = Math.min(parseInt(req.query.hours) || 24, 168); // max 7 days
    const start = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const end = new Date().toISOString();

    const { data } = await ha().get(
      `/api/history/period/${start}?end_time=${end}&filter_entity_id=${entityId}&minimal_response=true&no_attributes=true`
    );

    // data is array of arrays; first (and only) array is the entity's history
    const series = (data[0] || [])
      .filter((s) => s.state !== 'unavailable' && s.state !== 'unknown')
      .map((s) => ({
        t: new Date(s.last_changed).getTime(),
        v: parseFloat(s.state),
      }))
      .filter((s) => !isNaN(s.v));

    res.json(series);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Home Assistant' });
  }
});

// Forecast proxy — WU API key never leaves the server
// GET /api/weather/forecast
router.get('/forecast', async (req, res) => {
  const key = process.env.WU_API_KEY;
  if (!key) return res.status(503).json({ error: 'WU_API_KEY not configured' });

  const base = 'https://api.weather.com/v1/geocode/39.690/-105.124/forecast';
  const params = `apiKey=${key}&units=e&language=en-US`;

  try {
    const [hourlyRes, dailyRes] = await Promise.all([
      axios.get(`${base}/hourly/360hour.json?${params}`),
      axios.get(`${base}/daily/7day.json?${params}`),
    ]);

    const now = Date.now();

    const hours = (hourlyRes.data.forecasts ?? [])
      .filter((f) => f.fcst_valid * 1000 >= now)
      .slice(0, 24)
      .map((f) => ({
        time: new Date(f.fcst_valid * 1000).toISOString(),
        temp: f.temp ?? 0,
        feelsLike: f.feels_like ?? f.temp ?? 0,
        weatherCode: f.icon_code ?? 32,
        windSpeed: f.wspd ?? 0,
        precipProb: f.pop ?? 0,
      }));

    const days = (dailyRes.data.forecasts ?? []).slice(0, 7).map((f) => ({
      date: new Date(f.fcst_valid * 1000).toISOString().split('T')[0],
      high: f.high?.temp ?? f.temp ?? 0,
      low: f.low?.temp ?? f.temp ?? 0,
      weatherCode: f.day?.icon_code ?? f.night?.icon_code ?? 32,
      precipProb: f.day?.pop ?? f.night?.pop ?? 0,
      maxWind: f.day?.wspd ?? f.night?.wspd ?? 0,
    }));

    // Parse sunrise/sunset from WU daily (format: "6:42 AM" local time)
    let sunTimes = null;
    const today = dailyRes.data.forecasts?.[0];
    if (today?.sunrise && today?.sunset) {
      const dateStr = new Date(today.fcst_valid * 1000).toDateString();
      sunTimes = {
        sunrise: new Date(`${dateStr} ${today.sunrise}`).toISOString(),
        sunset: new Date(`${dateStr} ${today.sunset}`).toISOString(),
      };
    }

    res.json({ hours, days, sunTimes });
  } catch (err) {
    const status = err.response?.status ?? 502;
    res.status(status).json({ error: 'Failed to fetch forecast from Weather Underground' });
  }
});

// Webcam config — returns proxied HLS path; RTSP URL never leaves the server
router.get('/webcam', (req, res) => {
  const enabled = !!process.env.RTSP_URL;
  res.json({
    type: enabled ? 'hls' : 'disabled',
    url: enabled ? 'camera' : '',
  });
});

export default router;
