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


// WU v3 forecast proxy — key stays server-side, no CORS issues
// GET /api/weather/forecast
router.get('/forecast', async (req, res) => {
  try {
    const key = process.env.WU_API_KEY;
    if (!key) return res.status(503).json({ error: 'WU_API_KEY not configured' });

    const params = {
      geocode: '39.706522,-105.154665',
      format: 'json',
      units: 'e',
      language: 'en-US',
      apiKey: key,
    };

    // Fetch hourly and daily in parallel
    const [hourlyRes, dailyRes] = await Promise.all([
      axios.get('https://api.weather.com/v3/wx/forecast/hourly/10day', { params, timeout: 10000 }),
      axios.get('https://api.weather.com/v3/wx/forecast/daily/5day',   { params, timeout: 10000 }),
    ]);

    const h = hourlyRes.data;
    const d = dailyRes.data;
    const dp = d.daypart?.[0] ?? {};

    // Next 24 hours of true hourly data
    const now = Date.now();
    const hours = (h.validTimeLocal ?? [])
      .map((iso, i) => ({
        time: iso,
        temp: h.temperature?.[i] ?? null,
        feelsLike: h.temperatureFeelsLike?.[i] ?? h.temperature?.[i] ?? null,
        weatherCode: h.iconCode?.[i] ?? 44,
        windSpeed: h.windSpeed?.[i] ?? 0,
        precipProb: h.precipChance?.[i] ?? 0,
      }))
      .filter((entry) => entry.temp != null && new Date(entry.time).getTime() >= now)
      .slice(0, 24);

    // 5 daily summary cards
    const days = (d.validTimeLocal ?? []).map((iso, i) => ({
      date: iso.slice(0, 10),
      high: d.calendarDayTemperatureMax?.[i] ?? d.temperatureMax?.[i] ?? null,
      low: d.calendarDayTemperatureMin?.[i] ?? d.temperatureMin?.[i] ?? null,
      // prefer daytime icon (i*2), fall back to night (i*2+1)
      weatherCode: dp.iconCode?.[i * 2] ?? dp.iconCode?.[i * 2 + 1] ?? 44,
      precipProb: Math.max(dp.precipChance?.[i * 2] ?? 0, dp.precipChance?.[i * 2 + 1] ?? 0),
      maxWind: Math.max(dp.windSpeed?.[i * 2] ?? 0, dp.windSpeed?.[i * 2 + 1] ?? 0),
    }));

    const sunTimes = d.sunriseTimeLocal?.[0]
      ? { sunrise: d.sunriseTimeLocal[0], sunset: d.sunsetTimeLocal[0] }
      : null;

    res.json({ hours, days, sunTimes });
  } catch (err) {
    console.error('WU forecast error:', err.message);
    res.status(502).json({ error: 'Failed to fetch WU forecast' });
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
