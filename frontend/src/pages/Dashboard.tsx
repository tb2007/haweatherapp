import { useCurrentWeather, lastUpdated } from '../hooks/useCurrentWeather';
import { ENTITIES } from '../constants/entities';
import { Header } from '../components/layout/Header';
import { WeatherHero } from '../components/current/WeatherHero';
import { RainPanel } from '../components/current/RainPanel';
import { AirQualityPanel } from '../components/current/AirQualityPanel';
import { SoilPanel } from '../components/current/SoilPanel';
import { WebcamPanel } from '../components/webcam/WebcamPanel';
import { TemperatureChart } from '../components/charts/TemperatureChart';
import { PressureChart } from '../components/charts/PressureChart';
import { WindChart } from '../components/charts/WindChart';
import { RainChart } from '../components/charts/RainChart';
import { CO2Chart, PMChart } from '../components/charts/AirQualityChart';
import { SoilChart } from '../components/charts/SoilChart';

export function Dashboard() {
  const { data } = useCurrentWeather();
  const updated = lastUpdated(data, ENTITIES.temperature);

  return (
    <div className="flex min-h-screen flex-col">
      <Header lastUpdated={updated} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <WeatherHero />
          <RainPanel />
          <AirQualityPanel />
          <SoilPanel />
          <WebcamPanel />

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
              Historical Data
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TemperatureChart />
              <PressureChart />
              <WindChart />
              <RainChart />
              <CO2Chart />
              <PMChart />
              <div className="lg:col-span-2">
                <SoilChart />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-700 py-3 text-center text-xs text-slate-500">
        Ecowitt GW1100B via Home Assistant
      </footer>
    </div>
  );
}
