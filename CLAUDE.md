# haweatherapp

A self-hosted, internet-exposed weather dashboard for an Ecowitt GW1100B station via Home Assistant.

## Architecture

```
Internet
  → nginx reverse proxy (TLS termination, external — not in this repo)
    → frontend container  (nginx:alpine serving Vite static build, port 3000)
         /api/*    → api container    (Node/Express, port 3001, internal only)
                              ↓
                        Home Assistant  http://hatb.ad.bpu.link:8123
         /go2rtc/  → go2rtc container  (port 1984, internal only)
                              ↓
                        RTSP camera
```

The frontend container's nginx proxies `/api/*` to the `api` container over the internal Docker bridge network. The HA token lives only in the API container environment — it is never sent to the browser.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| Data fetching | TanStack Query (React Query v5) |
| Charts | Recharts |
| HTTP client | Axios |
| Backend | Node.js + Express (ESM) |
| Auth | JWT via httpOnly cookies (8h expiry) |
| Security | helmet, express-rate-limit |
| Container | Docker multi-stage build; docker-compose |

## Project Structure

```
weatherapp/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── CLAUDE.md
├── api/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js               # Express app, rate limiting, helmet
│   ├── middleware/
│   │   └── auth.js             # JWT cookie verification
│   └── routes/
│       ├── auth.js             # POST /api/auth/login|logout, GET /api/auth/me
│       └── weather.js          # GET /api/weather/states|history/:id|webcam
└── frontend/
    ├── Dockerfile              # multi-stage: node build → nginx:alpine
    ├── nginx.conf              # SPA fallback + /api/ proxy_pass to api:3001
    ├── package.json
    ├── vite.config.ts          # dev: proxies /api → localhost:3001
    ├── tailwind.config.js
    └── src/
        ├── api/client.ts           # Axios instance; 401 → redirect to /login
        ├── constants/entities.ts   # All HA entity IDs + poll/refresh intervals
        ├── contexts/AuthContext.tsx # Session state, login/logout
        ├── hooks/
        │   ├── useCurrentWeather.ts   # Polls all entities every 30s
        │   ├── useHistoricalData.ts   # HA history API, refreshes every 5min
        │   └── useWebcam.ts           # Fetches webcam config once
        ├── pages/
        │   ├── Login.tsx
        │   └── Dashboard.tsx
        └── components/
            ├── layout/Header.tsx
            ├── current/
            │   ├── WeatherHero.tsx       # Temperature hero + key stats
            │   ├── StatCard.tsx          # Reusable metric tile
            │   ├── WindCompass.tsx       # SVG compass rose
            │   ├── RainPanel.tsx
            │   ├── AirQualityPanel.tsx   # CO2/PM with color thresholds
            │   └── SoilPanel.tsx         # Moisture bars for 5 zones
            ├── charts/
            │   ├── BaseChart.tsx         # Shared Recharts AreaChart wrapper
            │   ├── ChartContainer.tsx    # Title + TimeRangePicker wrapper
            │   ├── TemperatureChart.tsx
            │   ├── PressureChart.tsx
            │   ├── WindChart.tsx
            │   ├── RainChart.tsx
            │   ├── AirQualityChart.tsx   # CO2Chart + PMChart
            │   └── SoilChart.tsx
            ├── webcam/WebcamPanel.tsx    # HLS (hls.js), MJPEG, YouTube
            └── ui/
                ├── LoadingSpinner.tsx
                └── TimeRangePicker.tsx   # 6h / 24h / 48h / 7d
```

## Home Assistant Entities (Ecowitt GW1100B)

| Sensor | Entity ID |
|---|---|
| Temperature | `sensor.gw1100b_v2_0_4_temperature_1` |
| Windchill | `sensor.gw1100b_v2_0_4_windchill` |
| Relative Pressure | `sensor.gw1100b_v2_0_4_relative_pressure` |
| Wind Speed | `sensor.gw1100b_v2_0_4_wind_speed` |
| Wind Gust | `sensor.gw1100b_v2_0_4_wind_gust` |
| Wind Direction | `sensor.gw1100b_v2_0_4_wind_direction` |
| UV Index | `sensor.gw1100b_v2_0_4_uv_index` |
| Solar Radiation | `sensor.gw1100b_v2_0_4_solar_radiation` |
| Solar Lux | `sensor.gw1100b_v2_0_4_solar_lux` |
| Total Rain | `sensor.gw1100b_v2_0_4_total_rain` |
| Weekly Rain | `sensor.gw1100b_v2_0_4_weekly_rain_rate` |
| Yearly Rain | `sensor.gw1100b_v2_0_4_yearly_rain_rate` |
| CO₂ | `sensor.gw1100b_wh45_co2` |
| CO₂ 24h avg | `sensor.gw1100b_wh45_co2_24h_average` |
| PM2.5 | `sensor.gw1100b_wh45_pm2_5_co2` |
| PM2.5 24h avg | `sensor.gw1100b_wh45_pm2_5_co2_24h_average` |
| PM10 | `sensor.gw1100b_wh45_pm10_co2` |
| PM10 24h avg | `sensor.gw1100b_wh45_pm10_co2_24h_average` |
| Indoor Temp (WH45) | `sensor.gw1100b_wh45_temperature` |
| Indoor Humidity (WH45) | `sensor.gw1100b_wh45_humidity` |
| Soil Moisture 1 | `sensor.gw1100b_v2_0_4_soil_moisture_1` |
| Soil Moisture 3 | `sensor.gw1100b_v2_0_4_soil_moisture_3` |
| Soil Moisture 4 | `sensor.gw1100b_soil_moisture_4` |
| Soil Moisture 5 | `sensor.gw1100b_soil_moisture_5` |
| Soil Moisture 6 | `sensor.gw1100b_soil_moisture_6` |
| Water Shutoff Temp | `sensor.gw1100b_temperature_2` |

## Environment Variables

Copy `.env.example` to `.env` and fill in all values before deploying.

| Variable | Description |
|---|---|
| `HA_BASE_URL` | Home Assistant internal URL, e.g. `http://hatb.ad.bpu.link:8123` |
| `HA_TOKEN` | HA long-lived access token (Profile → Long-Lived Access Tokens) |
| `APP_USERNAME` | Login username for the web app |
| `APP_PASSWORD` | Login password for the web app |
| `JWT_SECRET` | Random 64-char string for signing JWTs — generate with `openssl rand -hex 32` |
| `RTSP_URL` | RTSP stream URL, e.g. `rtsp://user:pass@ip:554/stream`. Leave blank to disable the webcam panel. |

## Deployment

```bash
cp .env.example .env
# edit .env

docker compose up -d --build
```

Point your nginx reverse proxy at port `3000`. TLS is handled by the external proxy.

Recommended external nginx snippet:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Webcam Setup (RTSP)

RTSP cannot play natively in a browser. go2rtc runs as a sidecar container inside the Docker Compose stack and transcodes RTSP → HLS. The browser only ever sees a same-origin `/go2rtc/` path — the RTSP URL never leaves the server.

**Setup:**
Set `RTSP_URL` in `.env`:
```
RTSP_URL=rtsp://user:pass@camera-ip:554/stream
```

That's it. On `docker compose up`, go2rtc starts, ingests the stream, and the frontend fetches HLS from `/go2rtc/api/stream.m3u8?src=camera` via the nginx proxy.

**How it works:**
```
Browser → nginx (/go2rtc/) → go2rtc:1984 → RTSP camera
```

The `go2rtc/go2rtc.yaml` config defines a single stream named `camera` sourced from `${RTSP_URL}`. The API webcam endpoint checks if `RTSP_URL` is set and returns the HLS path; if not set, the webcam panel is hidden.

**Webcam disabled:** leave `RTSP_URL` blank in `.env`.

## Live Data

- Current conditions poll every **30 seconds** via React Query
- Historical charts refresh every **5 minutes** in background
- Time ranges available: 6h / 24h / 48h / 7d
- Last updated timestamp shown in the header

## Security Design

- HA token stored only in API container env — never sent to browser
- Auth uses httpOnly, SameSite=strict cookies — not accessible to JavaScript (XSS-safe)
- Login endpoint rate-limited to 10 attempts per 15 minutes
- All API routes rate-limited to 120 req/min
- `helmet` sets security headers on all API responses
- `trust proxy` enabled for correct IP detection behind nginx

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Live updates | Polling (30s) | Simpler than WebSocket; weather data doesn't need sub-second latency |
| Auth storage | httpOnly cookie | Survives page reload; immune to XSS vs localStorage/memory |
| Token location | API container only | Internet-exposed app; token in browser bundle is unacceptable |
| Charts | Recharts | React-native, responsive containers, no D3 imperative code |
| State management | TanStack Query only | All state is server data; no Redux/Zustand needed |
| Build | Multi-stage Docker | Node builder → nginx:alpine; minimal runtime image |
