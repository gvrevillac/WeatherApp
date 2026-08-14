import { Droplets, Wind, Eye, Gauge, Sun, Compass } from 'lucide-react';
import type { WeatherResponse } from '@/types/weather';
import { windDirectionLabel, uvLabel } from '@/lib/api';

interface WeatherDetailsProps {
  data: WeatherResponse;
}

export function WeatherDetails({ data }: WeatherDetailsProps) {
  const { current, units, daily } = data;
  const uv = uvLabel(current.uvIndex);
  const sunrise = daily.sunrise[0];
  const sunset = daily.sunset[0];

  const items = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${Math.round(current.humidity)}%`,
    },
    {
      icon: Wind,
      label: 'Wind',
      value: `${Math.round(current.windSpeed)} ${units.windSpeed}`,
      sub: `${windDirectionLabel(current.windDirection)} · ${Math.round(current.windDirection)}°`,
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${Math.round(current.pressure)} ${units.pressure}`,
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: current.visibility >= 1000
        ? `${(current.visibility / 1000).toFixed(1)} km`
        : `${Math.round(current.visibility)} m`,
    },
    {
      icon: Sun,
      label: 'UV Index',
      value: `${Math.round(current.uvIndex)}`,
      sub: uv.label,
    },
    {
      icon: Compass,
      label: 'Cloud Cover',
      value: `${Math.round(current.cloudCover)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-2 rounded-2xl bg-white/10 backdrop-blur-md p-4 ring-1 ring-white/15"
        >
          <div className="flex items-center gap-2 text-white/70">
            <item.icon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{item.label}</span>
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{item.value}</p>
            {item.sub && <p className="text-xs text-white/60 mt-0.5">{item.sub}</p>}
          </div>
        </div>
      ))}

      <div className="col-span-2 sm:col-span-3 flex flex-col gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-4 ring-1 ring-white/15">
        <div className="flex items-center gap-2 text-white/70">
          <Sun className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Sun</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-white/60">Sunrise</p>
            <p className="text-lg font-semibold text-white">
              {new Date(sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="relative flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-amber-300 to-orange-400" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-white/60">Sunset</p>
            <p className="text-lg font-semibold text-white">
              {new Date(sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
