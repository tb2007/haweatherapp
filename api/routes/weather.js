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

  const geo = '39.690,-105.124';
  const params = `geocode=${geo}&format=json&units=e&language=en-US&apiKey=${key}`;
  const base = 'https://api.weather.com/v3/wx/forecast';

  try {
    const [hourlyRes, dailyRes] = await Promise.all([
      axios.get(`${base}/hourly/1day?${params}`),
      axios.get(`${base}/daily/5day?${params}`),
    ]);

    const h = hourlyRes.data;
    const now = Date.now();

    const hours = (h.validTimeLocal ?? [])
      .map((t, i) => ({
        time: t,
        temp: h.temperature?.[i] ?? 0,
        feelsLike: h.temperatureFeelsLike?.[i] ?? h.temperature?.[i] ?? 0,
        weatherCode: h.iconCode?.[i] ?? 32,
        windSpeed: h.windSpeed?.[i] ?? 0,
        precipProb: h.precipChance?.[i] ?? 0,
      }))
      .filter((hr) => new Date(hr.time).getTime() >= now);

    const d = dailyRes.data;
    // v3 daily: daypart has 2*N entries — even indices = daytime, odd = nighttime
    const dp = d.daypart?.[0] ?? {};

    const days = (d.validTimeLocal ?? []).map((t, i) => ({
      date: t.split('T')[0],
      high: d.calendarDayTemperatureMax?.[i] ?? 0,
      low: d.calendarDayTemperatureMin?.[i] ?? 0,
      weatherCode: dp.iconCode?.[i * 2] ?? dp.iconCode?.[i * 2 + 1] ?? 32,
      precipProb: dp.precipChance?.[i * 2] ?? dp.precipChance?.[i * 2 + 1] ?? 0,
      maxWind: dp.windSpeed?.[i * 2] ?? dp.windSpeed?.[i * 2 + 1] ?? 0,
    }));

    // Sunrise/sunset from v3 daily response
    let sunTimes = null;
    if (d.sunriseTimeLocal?.[0] && d.sunsetTimeLocal?.[0]) {
      sunTimes = {
        sunrise: new Date(d.sunriseTimeLocal[0]).toISOString(),
        sunset: new Date(d.sunsetTimeLocal[0]).toISOString(),
      };
    }

    res.json({ hours, days, sunTimes });
  } catch (err) {
    const status = err.response?.status ?? 502;
    console.error('[WU forecast]', status, err.response?.data ?? err.message);
    res.status(status).json({ error: 'Failed to fetch forecast', detail: err.response?.data ?? err.message });
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
