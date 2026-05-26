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
        │   ├── useCurrentWeather.ts   # Polls all entities every 20s
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
            ├── layout/Header.tsx      # Sticky header; pulsing green dot + "Next update in Xs" countdown
            ├── alerts/AlertBanner.tsx # NWS alert banner, color-coded by severity
            ├── current/
            │   ├── WeatherHero.tsx    # Temp, feels like, WMO condition icon, pressure+trend, humidity, AQI inline, ☀️Rise/🌙Set
            │   ├── StatCard.tsx       # Reusable metric tile
            │   ├── WindCompass.tsx    # SVG compass rose
            │   ├── RainPanel.tsx      # Rain Event | Weekly+Yearly combined (2-col grid)
            │   └── AQIPanel.tsx       # US AQI + PM2.5 (used only in WeatherHero inline row, not standalone)
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

| Sensor | Entity ID | Displayed |
|---|---|---|
| Outdoor Temperature | `sensor.gw1100b_v2_0_4_outdoor_temperature` | ✓ |
| Outdoor Humidity | `sensor.gw1100b_v2_0_4_humidity` | ✓ |
| Relative Pressure | `sensor.gw1100b_v2_0_4_relative_pressure` | ✓ |
| Wind Speed | `sensor.gw1100b_v2_0_4_wind_speed` | ✓ |
| Wind Gust | `sensor.gw1100b_v2_0_4_wind_gust` | ✓ |
| Wind Direction | `sensor.gw1100b_v2_0_4_wind_direction` | ✓ |
| UV Index | `sensor.gw1100b_v2_0_4_uv_index` | ✓ |
| Solar Radiation | `sensor.gw1100b_v2_0_4_solar_radiation` | tracked, not displayed |
| Solar Lux | `sensor.gw1100b_v2_0_4_solar_lux` | tracked, not displayed |
| Total Rain | `sensor.gw1100b_v2_0_4_total_rain` | ✓ (DailyRainChart) |
| Weekly Rain | `sensor.gw1100b_v2_0_4_weekly_rain_rate` | ✓ |
| Yearly Rain | `sensor.gw1100b_v2_0_4_yearly_rain_rate` | ✓ |
| Indoor Humidity (WH45) | `sensor.gw1100b_wh45_humidity` | ✓ |

Removed from tracking: CO₂, PM2.5, PM10 (using Open-Meteo AQI instead), soil moisture sensors, windchill, water shutoff temp display.

## External APIs (no keys required)

| API | Usage | Refresh |
|---|---|---|
| Open-Meteo forecast | Hourly temp, apparent temp, weather code, wind + daily sunrise/sunset | 30 min |
| Open-Meteo air quality | US AQI, PM2.5 for Lakewood, CO (39.706522, -105.154665) | 30 min |
| weather.gov NWS | Active alerts for point 39.706522,-105.154665 (Jefferson County) | 10 min |

## Environment Variables

Copy `.env.example` to `.env` and fill in all values before deploying.

| Variable | Description |
|---|---|
| `HA_BASE_URL` | Home Assistant internal URL, e.g. `http://hatb.ad.bpu.link:8123` |
| `HA_TOKEN` | HA long-lived access token (Profile → Long-Lived Access Tokens) |
| `APP_USERNAME` | Login username (kept in .env but auth is disabled — app is public) |
| `APP_PASSWORD` | Login password (kept in .env but auth is disabled — app is public) |
| `JWT_SECRET` | JWT signing secret (kept in .env but auth is disabled) |
| `RTSP_URL` | RTSP stream URL for webcam, e.g. `rtsp://user:pass@ip:7447/token`. Leave blank to disable webcam. |
| `COOKIE_SECURE` | Set to `false` for HTTP testing. Defaults to `true`. (Moot — auth removed.) |

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

## Auto-Deploy via GitHub Actions

A self-hosted GitHub Actions runner on the Docker host auto-deploys on every push to `main`.

**Host setup (one-time):**
```bash
# Clone to deployment directory
sudo mkdir -p /media/dockerdata/haweatherapp
sudo chown plex:plex /media/dockerdata/haweatherapp
git clone https://github.com/tb2007/haweatherapp.git /media/dockerdata/haweatherapp

# Install runner (get token from GitHub → Settings → Actions → Runners)
mkdir -p ~/actions-runner && cd ~/actions-runner
# paste download + config commands from GitHub, then:
sudo ./svc.sh install && sudo ./svc.sh start

# Add runner user to docker group
sudo usermod -aG docker plex
```

**Runner runs as:** `plex` user (all files in `/media/dockerdata/haweatherapp/` must be owned by `plex`)

**On every push to `main` the workflow:**
1. `git pull origin main` in `/media/dockerdata/haweatherapp`
2. `docker compose up -d --build`
3. `docker image prune -f`

Manual deploy: GitHub → Actions → Deploy → Run workflow

**Known gotchas:**
- Runner files must be owned by the same user the service runs as (`plex`). If you see permission errors: `sudo chown -R plex:plex /media/dockerdata/haweatherapp`
- Add the deployment dir as a git safe directory for the runner user: `sudo -u plex git config --global --add safe.directory /media/dockerdata/haweatherapp`

## Webcam Setup (RTSP)

Set `RTSP_URL` in `.env`. go2rtc transcodes RTSP → MJPEG via ffmpeg. The RTSP URL never reaches the browser.

```
Browser → nginx (/go2rtc/) → go2rtc:1984 (ffmpeg H264→MJPEG) → RTSP camera
```

**Why MJPEG (not WebRTC or HLS):**
- WebRTC: fails through nginx reverse proxy — browser gets unreachable Docker-internal ICE candidates
- HLS: UniFi Protect keyframe interval is ~5s (not configurable) — each segment = 5s stutter
- MJPEG via `<img>` tag: no keyframe dependency, works on desktop and iOS Safari natively

**go2rtc requires a custom Dockerfile** (adds ffmpeg to base image):
```
go2rtc/Dockerfile: FROM alexxit/go2rtc + RUN apk add --no-cache ffmpeg
```

**go2rtc.yaml streams config:**
```yaml
streams:
  camera:
    - ${RTSP_URL}           # source
    - ffmpeg:camera#video=mjpeg  # MJPEG transcoder
```

Leave `RTSP_URL` blank to disable the webcam panel entirely.

## Live Data

- Current conditions poll every **20 seconds** via React Query
- Historical charts refresh every **5 minutes** in background
- Forecast + AQI refresh every **30 minutes**
- NWS alerts refresh every **10 minutes**
- Global time range picker (6h / 24h / 48h / 7d) controls all history charts simultaneously
- Header shows pulsing green dot + "Next update in Xs" live countdown (resets on each fetch using `dataUpdatedAt`, not HA entity timestamp)

## Security Design

- HA token stored only in API container env — never sent to browser
- App is fully **public** — `requireAuth` removed from `/api/weather` routes; no login needed
- Auth routes (`/api/auth/*`) still exist but are unused; login/logout endpoints remain in case auth is re-enabled
- All API routes rate-limited to 120 req/min
- `helmet` sets security headers on all API responses
- `trust proxy` enabled for correct IP detection behind nginx

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth | None (public) | Weather data isn't sensitive; removed login requirement |
| Live updates | Polling (20s) | Simpler than WebSocket; weather data doesn't need sub-second latency |
| Live indicator | Countdown + pulsing green dot | Uses `dataUpdatedAt` (fetch time), not HA `last_updated` (sensor change time) |
| Token location | API container only | Internet-exposed app; HA token in browser bundle is unacceptable |
| AQI display | Inline in WeatherHero pressure row | Compact; avoids a separate full-width panel |
| AQI source | Open-Meteo (not HA WH45) | Station CO₂/PM sensors removed; Open-Meteo provides calibrated AQI |
| Condition icon | WMO weather code from Open-Meteo forecast | Solar/lux removed from display; forecast code is more semantically correct |
| Webcam | MJPEG via img tag | WebRTC fails through nginx; HLS stutters (UniFi 5s keyframe); MJPEG works everywhere |
| Charts | Recharts | React-native, responsive containers, no D3 imperative code |
| State management | TanStack Query only | All state is server data; no Redux/Zustand needed |
| Build | Multi-stage Docker | Node builder → nginx:alpine; minimal runtime image |
| Mobile nav | Bottom fixed bar | Thumb-friendly; top tabs unreachable one-handed on phone |
| Font | Inter (Google Fonts) | Modern, readable, widely used in dashboards |

## UI Design Notes

- **Site name:** "Green Mountain Weather" — header, footer, browser tab title
- **Mobile:** Fixed bottom nav bar (`lg:hidden`), main content has `pb-24` to clear it
- **Desktop:** Sticky top tab bar (`hidden lg:block`)
- **Header live indicator:** Pulsing green dot (Tailwind `animate-ping`) + "Next update in Xs" countdown, ticks every 1s, resets on each fetch
- **StatCards:** `border-l-4` colored left border per category (pass `borderAccent` prop)
- **WeatherHero pressure row:** Pressure · trend badge · Humidity · AQI (number + label, color-coded) — all inline
- **WeatherHero condition icon:** Derived from WMO weather code (`forecast.hours[0].weatherCode`), night-aware via sunrise/sunset times
- **Sunrise/Sunset:** ☀️ Rise 6:42 AM · 🌙 Set 8:11 PM
- **Rain panel:** 2-column grid — "Rain Event" | "Weekly / Yearly" (combined card with stacked values)
- **AQI:** Inline in WeatherHero, not a separate panel. `AQIPanel.tsx` still exists for the gradient bar if needed.
- **Webcam:** `<img>` with `onLoad`/`onError` states + pulsing red LIVE badge overlay
- **Pressure trend:** Colored pill badge — green "↑ Rising", red "↓ Falling", slate "→ Steady"
- **Charts:** 260px height (was 200px); DailyRainChart also 260px
- **Forecast cards:** Show precipitation probability (`💧 %`) from Open-Meteo `precipitation_probability` field
