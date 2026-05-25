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


// WU v3 daily 5-day forecast proxy — key stays server-side, no CORS issues
// GET /api/weather/forecast
router.get('/forecast', async (req, res) => {
  try {
    const key = process.env.WU_API_KEY;
    if (!key) return res.status(503).json({ error: 'WU_API_KEY not configured' });

    const { data } = await axios.get(
      'https://api.weather.com/v3/wx/forecast/daily/5day',
      {
        params: {
          geocode: '39.690,-105.124',
          format: 'json',
          units: 'e',
          language: 'en-US',
          apiKey: key,
        },
        timeout: 10000,
      }
    );

    const dp = data.daypart?.[0] ?? {};

    // 5 daily summary cards
    const days = (data.validTimeLocal ?? []).map((iso, i) => ({
      date: iso.slice(0, 10),
      high: data.calendarDayTemperatureMax?.[i] ?? data.temperatureMax?.[i] ?? null,
      low: data.calendarDayTemperatureMin?.[i] ?? data.temperatureMin?.[i] ?? null,
      // prefer daytime icon (i*2), fall back to night (i*2+1)
      weatherCode: dp.iconCode?.[i * 2] ?? dp.iconCode?.[i * 2 + 1] ?? 44,
      precipProb: Math.max(dp.precipChance?.[i * 2] ?? 0, dp.precipChance?.[i * 2 + 1] ?? 0),
      maxWind: Math.max(dp.windSpeed?.[i * 2] ?? 0, dp.windSpeed?.[i * 2 + 1] ?? 0),
    }));

    // daypart entries (day + night per day, nulls skipped = past periods)
    const hours = [];
    const dpLen = (dp.temperature ?? []).length;
    for (let i = 0; i < dpLen; i++) {
      const temp = dp.temperature?.[i];
      if (temp == null) continue; // past daytime slot
      const isNight = dp.dayOrNight?.[i] === 'N';
      const dayIdx = Math.floor(i / 2);
      const baseDate = (data.validTimeLocal?.[dayIdx] ?? '').slice(0, 10);
      hours.push({
        time: `${baseDate}T${isNight ? '20' : '09'}:00`,
        temp,
        feelsLike: (isNight ? dp.temperatureWindChill?.[i] : dp.temperatureHeatIndex?.[i]) ?? temp,
        weatherCode: dp.iconCode?.[i] ?? 44,
        windSpeed: dp.windSpeed?.[i] ?? 0,
        precipProb: dp.precipChance?.[i] ?? 0,
      });
    }

    const sunTimes = data.sunriseTimeLocal?.[0]
      ? { sunrise: data.sunriseTimeLocal[0], sunset: data.sunsetTimeLocal[0] }
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
