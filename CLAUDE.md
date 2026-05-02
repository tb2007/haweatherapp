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
│   ├── server.js               # Express app, rate limiting, helmet, dotenv
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
        ├── api/client.ts           # Axios instance; 401 → redirect to /login (skipped on /login)
        ├── constants/entities.ts   # Active HA entity IDs + poll/refresh intervals
        ├── contexts/AuthContext.tsx # Session state, login/logout
        ├── hooks/
        │   ├── useCurrentWeather.ts   # Polls all entities every 30s
        │   ├── useHistoricalData.ts   # HA history API, refreshes every 5min
        │   ├── useWebcam.ts           # Fetches webcam config once
        │   ├── useForecast.ts         # Open-Meteo hourly forecast + sunrise/sunset, 30min refresh
        │   ├── useNWSAlerts.ts        # NWS active alerts for Jefferson County, 10min refresh
        │   ├── useAirQuality.ts       # Open-Meteo US AQI + PM2.5, 30min refresh
        │   └── usePressureTrend.ts    # Computes rising/falling/steady from last 3h pressure
        ├── pages/
        │   ├── Login.tsx
        │   └── Dashboard.tsx          # Tab layout: Current | History
        └── components/
            ├── layout/Header.tsx      # Sticky header with last-updated timestamp
            ├── alerts/AlertBanner.tsx # NWS alert banner, color-coded by severity
            ├── current/
            │   ├── WeatherHero.tsx    # Temp, feels like, condition icon, pressure trend, sunrise/sunset
            │   ├── StatCard.tsx       # Reusable metric tile
            │   ├── WindCompass.tsx    # SVG compass rose
            │   ├── RainPanel.tsx      # Total/weekly/yearly rain stat cards
            │   └── AQIPanel.tsx       # US AQI + PM2.5 from Open-Meteo, color-coded
            ├── forecast/
            │   └── HourlyForecast.tsx # 24h scrollable cards: time, icon, condition, temp, wind
            ├── charts/
            │   ├── BaseChart.tsx         # Shared Recharts AreaChart wrapper (decimals, yAxisWidth props)
            │   ├── ChartContainer.tsx    # Title wrapper; hours passed from Dashboard global picker
            │   ├── TemperatureChart.tsx  # Full-width; Low/High badges
            │   ├── PressureChart.tsx     # 2 decimal places, wide Y-axis
            │   ├── WindChart.tsx         # Rolling average smoothing; Max Wind/Max Gust badges
            │   ├── RainChart.tsx         # Cumulative total rain area chart
            │   └── DailyRainChart.tsx    # Bar chart of daily rain totals (7 days, computed from cumulative)
            ├── webcam/WebcamPanel.tsx    # HLS (hls.js), MJPEG, YouTube; hidden if RTSP_URL unset
            └── ui/
                ├── LoadingSpinner.tsx
                └── TimeRangePicker.tsx   # 6h / 24h / 48h / 7d — global for History tab
```

## Active Home Assistant Entities (Ecowitt GW1100B)

| Sensor | Entity ID |
|---|---|
| Outdoor Temperature | `sensor.gw1100b_v2_0_4_outdoor_temperature` |
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
| Indoor Humidity (WH45) | `sensor.gw1100b_wh45_humidity` |

Removed from tracking: CO₂, PM2.5, PM10 (using Open-Meteo AQI instead), soil moisture sensors, windchill, water shutoff temp display.

## External APIs (no keys required)

| API | Usage | Refresh |
|---|---|---|
| Open-Meteo forecast | Hourly temp, apparent temp, weather code, wind + daily sunrise/sunset | 30 min |
| Open-Meteo air quality | US AQI, PM2.5 for Lakewood, CO (39.690, -105.124) | 30 min |
| weather.gov NWS | Active alerts for point 39.690,-105.124 (Jefferson County) | 10 min |

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

## Local Development

```bash
# Terminal 1 — API on :3001
cd api && node server.js

# Terminal 2 — Frontend on :5173
cd frontend && npm run dev
```

**Important:** Use `node server.js` directly, not `npm run dev`. The `--watch` flag keeps the process alive across crashes and preserves in-memory rate limit state, causing spurious "too many requests" errors during dev.

The `.env` file must be at the project root (`weatherapp/.env`). dotenv is configured to look one directory up from `api/server.js`.

## Deployment

```bash
cp .env.example .env
# edit .env

docker compose up -d --build
```

Point your nginx reverse proxy at port `3000`. TLS is handled by the external proxy.

## Webcam Setup (RTSP)

Set `RTSP_URL` in `.env`. go2rtc transcodes RTSP → HLS internally; the RTSP URL never reaches the browser.

```
Browser → nginx (/go2rtc/) → go2rtc:1984 → RTSP camera
```

Leave `RTSP_URL` blank to disable the webcam panel entirely.

## Live Data

- Current conditions poll every **30 seconds** via React Query
- Historical charts refresh every **5 minutes** in background
- Forecast + AQI refresh every **30 minutes**
- NWS alerts refresh every **10 minutes**
- Global time range picker (6h / 24h / 48h / 7d) controls all history charts simultaneously
- Last updated timestamp shown in sticky header

## Security Design

- HA token stored only in API container env — never sent to browser
- Auth uses httpOnly, SameSite=strict cookies — not accessible to JavaScript (XSS-safe)
- Login endpoint rate-limited to 10 attempts/15 min in production (100 in dev)
- All API routes rate-limited to 120 req/min
- `helmet` sets security headers on all API responses
- `trust proxy` enabled for correct IP detection behind nginx
- 401 redirect skipped when already on `/login` to prevent infinite reload loop

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Live updates | Polling (30s) | Simpler than WebSocket; weather data doesn't need sub-second latency |
| Auth storage | httpOnly cookie | Survives page reload; immune to XSS vs localStorage/memory |
| Token location | API container only | Internet-exposed app; token in browser bundle is unacceptable |
| AQI source | Open-Meteo (not HA WH45) | Station CO₂/PM sensors removed from tracking; Open-Meteo provides calibrated AQI |
| Charts | Recharts | React-native, responsive containers, no D3 imperative code |
| State management | TanStack Query only | All state is server data; no Redux/Zustand needed |
| Build | Multi-stage Docker | Node builder → nginx:alpine; minimal runtime image |
