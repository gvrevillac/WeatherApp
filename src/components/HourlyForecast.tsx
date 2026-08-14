import { useRef } from 'react';
import { Droplets, Wind, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeatherResponse } from '@/types/weather';
import { getWeatherInfo } from '@/lib/weatherCodes';
import { getWeatherIcon } from '@/lib/icons';
import { formatHour } from '@/lib/api';

interface HourlyForecastProps {
  data: WeatherResponse;
}

export function HourlyForecast({ data }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const nowStr = now.toISOString().slice(0, 13);
  let startIdx = data.hourly.time.findIndex((t) => t.slice(0, 13) === nowStr);
  if (startIdx < 0) {
    const todayStr = now.toISOString().slice(0, 10);
    startIdx = data.hourly.time.findIndex((t) => t.slice(0, 10) === todayStr);
  }
  if (startIdx < 0) startIdx = 0;

  const hours = data.hourly.time.slice(startIdx, startIdx + 24);

  function scroll(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 ring-1 ring-white/15">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Next 24 Hours</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(-1)}
            className="rounded-full p-1.5 text-white/60 hover:bg-white/15 hover:text-white transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="rounded-full p-1.5 text-white/60 hover:bg-white/15 hover:text-white transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {hours.map((time, i) => {
          const idx = startIdx + i;
          const info = getWeatherInfo(data.hourly.weatherCode[idx]);
          const Icon = getWeatherIcon(info.icon);
          const isDay = data.hourly.isDay[idx] === 1;
          const isNow = i === 0;

          return (
            <div
              key={time}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 min-w-[64px] transition ${
                isNow ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'
              }`}
            >
              <span className="text-xs text-white/70">
                {isNow ? 'Now' : formatHour(time)}
              </span>
              <Icon className={`h-6 w-6 ${isDay ? 'text-yellow-300' : 'text-white/80'}`} />
              <span className="text-sm font-semibold text-white">
                {Math.round(data.hourly.temperature[idx])}°
              </span>
              <div className="flex items-center gap-0.5 text-[10px] text-sky-200">
                <Droplets className="h-2.5 w-2.5" />
                {data.hourly.precipitationProbability[idx]}%
              </div>
              <div className="flex items-center gap-0.5 text-[10px] text-white/50">
                <Wind className="h-2.5 w-2.5" />
                {Math.round(data.hourly.windSpeed[idx])}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
