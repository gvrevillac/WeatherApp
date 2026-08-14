import { MapPin, Sunrise, Sunset } from 'lucide-react';
import type { WeatherResponse } from '@/types/weather';
import { getWeatherInfo, getWeatherBackground } from '@/lib/weatherCodes';
import { getWeatherIcon } from '@/lib/icons';
import { formatTime } from '@/lib/api';

interface CurrentWeatherProps {
  data: WeatherResponse;
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const { current, location, units, daily } = data;
  const info = getWeatherInfo(current.weatherCode);
  const Icon = getWeatherIcon(info.icon);
  const bg = getWeatherBackground(current.weatherCode, current.isDay);
  const todayMax = Math.round(daily.temperatureMax[0]);
  const todayMin = Math.round(daily.temperatureMin[0]);

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bg} p-6 sm:p-8 shadow-2xl ring-1 ring-white/10`}>
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />

      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-white/80">
              <MapPin className="h-4 w-4 shrink-0" />
              <h2 className="text-lg font-semibold text-white truncate">
                {location.name}
              </h2>
            </div>
            <p className="text-sm text-white/60 mt-0.5">
              {[location.admin1, location.country].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start">
            <span className="text-7xl sm:text-8xl font-extralight text-white leading-none tracking-tighter">
              {Math.round(current.temperature)}
            </span>
            <span className="text-3xl font-light text-white/80 mt-2">{units.temperature}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Icon className="h-20 w-20 text-white drop-shadow-lg" />
            </div>
            <span className="text-sm font-medium text-white/90">{info.label}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          <span>Feels like <strong className="font-semibold text-white">{Math.round(current.apparentTemperature)}°</strong></span>
          <span className="flex items-center gap-1">
            <span className="text-white/60">H:</span>
            <strong className="font-semibold text-white">{todayMax}°</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-white/60">L:</span>
            <strong className="font-semibold text-white">{todayMin}°</strong>
          </span>
          <span className="flex items-center gap-1">
            <Sunrise className="h-3.5 w-3.5" />
            {formatTime(daily.sunrise[0])}
          </span>
          <span className="flex items-center gap-1">
            <Sunset className="h-3.5 w-3.5" />
            {formatTime(daily.sunset[0])}
          </span>
        </div>
      </div>
    </div>
  );
}
