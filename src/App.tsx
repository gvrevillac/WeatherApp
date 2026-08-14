import { useState, useEffect, useCallback } from 'react';
import { CloudSun, Loader2, AlertTriangle, Wind, CalendarDays, Clock } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { CurrentWeather } from '@/components/CurrentWeather';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { WeatherDetails } from '@/components/WeatherDetails';
import { HistoryView } from '@/components/HistoryView';
import { getWeather } from '@/lib/api';
import { getWeatherBackground } from '@/lib/weatherCodes';
import type { GeoLocation, WeatherResponse } from '@/types/weather';

const DEFAULT_LOCATION: GeoLocation = {
  id: 5128581,
  name: 'New York',
  latitude: 40.7143,
  longitude: -74.006,
  country: 'United States',
  country_code: 'US',
  admin1: 'New York',
  timezone: 'America/New_York',
};

type ViewTab = 'forecast' | 'history';

export default function App() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ViewTab>('forecast');

  const fetchWeather = useCallback(async (loc: GeoLocation) => {
    setLoading(true);
    setError(null);
    setLocation(loc);
    try {
      const data = await getWeather(loc);
      setWeather(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(DEFAULT_LOCATION);
  }, [fetchWeather]);

  const bg = weather
    ? getWeatherBackground(weather.current.weatherCode, weather.current.isDay)
    : 'from-slate-800 via-slate-900 to-slate-950';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bg} transition-all duration-700`}>
      <div className="fixed inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-white">
            <CloudSun className="h-7 w-7" />
            <h1 className="text-xl font-bold tracking-tight">Weather</h1>
          </div>
          <SearchBar onSelect={fetchWeather} onUseGeolocation={fetchWeather} />
        </header>

        {/* Tabs */}
        {weather && !loading && !error && (
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setTab('forecast')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === 'forecast'
                  ? 'bg-white/25 text-white ring-1 ring-white/30'
                  : 'bg-white/10 text-white/70 ring-1 ring-white/15 hover:bg-white/15'
              }`}
            >
              <Clock className="h-4 w-4" />
              Forecast
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === 'history'
                  ? 'bg-white/25 text-white ring-1 ring-white/30'
                  : 'bg-white/10 text-white/70 ring-1 ring-white/15 hover:bg-white/15'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              History
            </button>
          </div>
        )}

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/70">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading weather data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-red-500/20 px-5 py-4 text-white ring-1 ring-red-400/30 backdrop-blur-md">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => fetchWeather(DEFAULT_LOCATION)}
              className="rounded-full bg-white/15 px-5 py-2 text-sm text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-white/25 transition"
            >
              Try again
            </button>
          </div>
        )}

        {weather && !loading && !error && (
          <main className="flex flex-col gap-4">
            {tab === 'forecast' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <CurrentWeather data={weather} />
                <HourlyForecast data={weather} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <WeatherDetails data={weather} />
                  <DailyForecast data={weather} />
                </div>
              </div>
            )}
            {tab === 'history' && <HistoryView location={location} />}
          </main>
        )}

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-center gap-1.5 text-xs text-white/40">
          <Wind className="h-3 w-3" />
          <span>Data by Open-Meteo.com</span>
        </footer>
      </div>
    </div>
  );
}
