import { Sunrise, Sunset, Droplets, Wind } from 'lucide-react';
import type { WeatherResponse } from '@/types/weather';
import { getWeatherInfo } from '@/lib/weatherCodes';
import { getWeatherIcon } from '@/lib/icons';
import { formatDay } from '@/lib/api';

interface DailyForecastProps {
  data: WeatherResponse;
}

export function DailyForecast({ data }: DailyForecastProps) {
  const { daily } = data;
  const allMax = Math.max(...daily.temperatureMax);
  const allMin = Math.min(...daily.temperatureMin);
  const range = allMax - allMin || 1;

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 ring-1 ring-white/15">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70 mb-4">7-Day Forecast</h3>
      <div className="flex flex-col">
        {daily.time.map((date, i) => {
          const info = getWeatherInfo(daily.weatherCode[i]);
          const Icon = getWeatherIcon(info.icon);
          const max = daily.temperatureMax[i];
          const min = daily.temperatureMin[i];
          const leftPct = ((min - allMin) / range) * 100;
          const widthPct = ((max - min) / range) * 100;

          return (
            <div
              key={date}
              className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0"
            >
              <div className="w-12 text-sm font-medium text-white/90">
                {i === 0 ? 'Today' : formatDay(date)}
              </div>
              <Icon className="h-5 w-5 text-white/80 shrink-0" />
              <div className="flex items-center gap-1 text-xs text-sky-200 w-12">
                <Droplets className="h-3 w-3" />
                {daily.precipitationProbability[i]}%
              </div>
              <div className="text-sm text-white/50 w-8 text-right">{Math.round(min)}°</div>
              <div className="relative flex-1 h-1.5 rounded-full bg-white/15">
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-300 via-yellow-300 to-orange-400"
                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` }}
                />
              </div>
              <div className="text-sm font-medium text-white w-8 text-right">{Math.round(max)}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
