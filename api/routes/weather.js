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

// Webcam config — returns proxied stream names; RTSP URLs never leave the server
router.get('/webcam', (req, res) => {
  const cameras = [
    { id: 'camera', name: 'SnowCam', type: 'hls', url: 'camera', enabled: !!process.env.RTSP_URL },
    { id: 'camera2', name: 'AnimalAlley', type: 'hls', url: 'camera2', enabled: !!process.env.RTSP_URL_2 },
  ]
    .filter((c) => c.enabled)
    .map(({ enabled, ...c }) => c);

  res.json(cameras);
});

export default router;
