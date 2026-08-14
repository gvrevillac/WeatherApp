import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, AlertTriangle, Calendar, TrendingUp, Droplets, Wind, Thermometer,
  Gauge, Sun, Cloud, Snowflake, Sunrise, Sunset, Zap, Compass, X, Download,
} from 'lucide-react';
import { getHistoricalWeather, formatDateInput } from '@/lib/api';
import { getWeatherInfo } from '@/lib/weatherCodes';
import { getWeatherIcon } from '@/lib/icons';
import type { GeoLocation, HistoricalWeather, HistoricalDaily } from '@/types/weather';

interface HistoryViewProps {
  location: GeoLocation;
}

const WIND_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function windDirLabel(deg: number): string {
  return WIND_DIRS[Math.round(((deg % 360) / 22.5)) % 16];
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(isoStr: string): string {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function fmtDuration(seconds: number): string {
  if (!seconds || seconds === null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function downloadCsv(data: HistoricalWeather) {
  const d = data.daily;
  const headers = [
    'Date', 'Weather Code', 'Condition',
    'Temp Max', 'Temp Min', 'Temp Mean',
    'Apparent Temp Max', 'Apparent Temp Min',
    'Sunrise', 'Sunset', 'Daylight Duration (s)', 'Sunshine Duration (s)',
    'Precipitation Sum', 'Rain Sum', 'Showers Sum', 'Snowfall Sum', 'Precipitation Hours',
    'Wind Speed Max', 'Wind Gusts Max', 'Wind Direction Dominant',
    'Humidity Mean', 'Humidity Max', 'Humidity Min',
    'Pressure Mean', 'Pressure Max', 'Pressure Min',
    'Cloud Cover Mean', 'Dew Point Mean',
  ];

  const rows = d.time.map((_, i) => [
    d.time[i],
    d.weatherCode[i],
    getWeatherInfo(d.weatherCode[i]).label,
    d.temperatureMax[i], d.temperatureMin[i], d.temperatureMean[i],
    d.apparentTempMax[i], d.apparentTempMin[i],
    d.sunrise[i], d.sunset[i], d.daylightDuration[i], d.sunshineDuration[i],
    d.precipitationSum[i], d.rainSum[i], d.showersSum[i], d.snowfallSum[i], d.precipitationHours[i],
    d.windSpeedMax[i], d.windGustsMax[i], d.windDirectionDominant[i],
    d.humidityMean[i], d.humidityMax[i], d.humidityMin[i],
    d.pressureMean[i], d.pressureMax[i], d.pressureMin[i],
    d.cloudCoverMean[i], d.dewpointMean[i],
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weather-history_${data.location.name}_${data.startDate}_to_${data.endDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const BAR_MIN_WIDTH = 7;
const LABEL_INTERVAL = (len: number) => {
  if (len <= 14) return 1;
  if (len <= 31) return 5;
  if (len <= 90) return 14;
  return 30;
};

export function HistoryView({ location }: HistoryViewProps) {
  const today = new Date();
  const defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() - 1);
  const defaultStart = new Date(defaultEnd);
  defaultStart.setDate(defaultStart.getDate() - 13);

  const [startDate, setStartDate] = useState(formatDateInput(defaultStart));
  const [endDate, setEndDate] = useState(formatDateInput(defaultEnd));
  const [data, setData] = useState<HistoricalWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;
    if (startDate > endDate) {
      setError('Start date must be before end date');
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedDay(null);
    try {
      const result = await getHistoricalWeather(location, startDate, endDate);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load historical data');
    } finally {
      setLoading(false);
    }
  }, [location, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const days = data?.daily.time.length ?? 0;
  const maxTemp = data ? Math.max(...data.daily.temperatureMax) : 0;
  const minTemp = data ? Math.min(...data.daily.temperatureMin) : 0;
  const tempRange = maxTemp - minTemp || 1;
  const labelEvery = LABEL_INTERVAL(days);
  const chartWidth = days * (BAR_MIN_WIDTH + 4);
  const isScrollable = chartWidth > 700;

  function setPreset(days: number) {
    const end = new Date(today);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    setStartDate(formatDateInput(start));
    setEndDate(formatDateInput(end));
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Date range controls */}
      <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 ring-1 ring-white/15">
        <div className="flex items-center gap-2 text-white/70 mb-4">
          <Calendar className="h-4 w-4" />
          <h3 className="text-sm font-semibold uppercase tracking-wide">Select Date Range</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs text-white/60 mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl bg-white/15 text-white px-3 py-2.5 text-sm outline-none ring-1 ring-white/20 focus:ring-white/40 [color-scheme:dark]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-white/60 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={formatDateInput(today)}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl bg-white/15 text-white px-3 py-2.5 text-sm outline-none ring-1 ring-white/20 focus:ring-white/40 [color-scheme:dark]"
            />
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-xl bg-white/20 text-white px-5 py-2.5 text-sm font-medium ring-1 ring-white/25 hover:bg-white/30 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: 'Last 7 days', days: 7 },
            { label: 'Last 14 days', days: 14 },
            { label: 'Last 30 days', days: 30 },
            { label: 'Last 90 days', days: 90 },
            { label: 'Last 6 months', days: 180 },
            { label: 'Last year', days: 365 },
          ].map((preset) => (
            <button
              key={preset.days}
              onClick={() => setPreset(preset.days)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/15 hover:bg-white/20 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/20 px-5 py-4 text-white ring-1 ring-red-400/30 backdrop-blur-md">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/70">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading historical data...</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && !error && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={Thermometer} label="Avg Temp" value={`${Math.round(data.stats.tempAvg)}°`} />
            <StatCard icon={TrendingUp} label="Highest" value={`${Math.round(data.stats.tempMax)}°`} accent="text-orange-200" />
            <StatCard icon={TrendingUp} label="Lowest" value={`${Math.round(data.stats.tempMin)}°`} accent="text-sky-200" />
            <StatCard icon={Droplets} label="Total Precip" value={`${data.stats.precipTotal.toFixed(1)} ${data.units.precipitation}`} />
            <StatCard icon={Wind} label="Max Wind" value={`${Math.round(data.stats.windMax)} ${data.units.windSpeed}`} />
            <StatCard icon={Gauge} label="Avg Humidity" value={`${Math.round(data.stats.humidAvg)}%`} />
            <StatCard icon={Sun} label="Sunshine" value={fmtDuration(data.stats.sunshineTotal)} />
            <StatCard icon={Snowflake} label="Snowfall" value={`${data.stats.snowTotal.toFixed(1)} ${data.units.snowfall}`} />
            <StatCard icon={Zap} label="Max Gusts" value={`${Math.round(data.stats.gustMax)} ${data.units.windGusts}`} />
            <StatCard icon={Cloud} label="Avg Cloud" value={`${Math.round(data.stats.cloudAvg)}%`} />
          </div>

          {/* Temperature chart */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 ring-1 ring-white/15">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Temperature Trend</h3>
              {isScrollable && (
                <span className="text-xs text-white/40">Scroll to see all {days} days →</span>
              )}
            </div>
            <div ref={scrollRef} className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <div className="relative h-52 flex items-stretch gap-1" style={{ minWidth: isScrollable ? chartWidth : '100%' }}>
                {data.daily.time.map((date, i) => {
                  const tMax = data.daily.temperatureMax[i];
                  const tMin = data.daily.temperatureMin[i];
                  const minPct = ((tMin - minTemp) / tempRange) * 100;
                  const barHeight = Math.max(((tMax - tMin) / tempRange) * 100, 2);
                  const showLabel = i % labelEvery === 0;
                  return (
                    <div
                      key={date}
                      className="flex flex-col items-center group h-full cursor-pointer"
                      style={{ width: BAR_MIN_WIDTH, minWidth: BAR_MIN_WIDTH }}
                      onClick={() => setSelectedDay(i)}
                    >
                      <div className="relative flex-1 w-full flex items-end justify-center min-h-0">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-sky-400 to-orange-400 group-hover:from-sky-300 group-hover:to-orange-300 group-hover:w-[10px] transition-all"
                          style={{ height: `${barHeight}%`, marginBottom: `${minPct}%` }}
                          title={`${fmtDate(date)}: ${Math.round(tMin)}° – ${Math.round(tMax)}°`}
                        />
                      </div>
                      <span className={`text-[9px] text-white/50 shrink-0 mt-1 whitespace-nowrap ${showLabel ? '' : 'invisible'}`}>
                        {new Date(date + 'T00:00').toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-white/60">
              <span>Low: {Math.round(minTemp)}°</span>
              <span className="text-white/40">Click any bar for full details</span>
              <span>High: {Math.round(maxTemp)}°</span>
            </div>
          </div>

          {/* Daily table */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 ring-1 ring-white/15">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Daily Records ({days} days)
              </h3>
              <button
                onClick={() => downloadCsv(data)}
                className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/20 hover:bg-white/25 transition"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-white/50 text-xs uppercase tracking-wide border-b border-white/10">
                    <th className="text-left font-medium py-2 pr-4">Date</th>
                    <th className="text-center font-medium py-2 px-2">Cond.</th>
                    <th className="text-right font-medium py-2 px-2">High</th>
                    <th className="text-right font-medium py-2 px-2">Low</th>
                    <th className="text-right font-medium py-2 px-2 hidden sm:table-cell">Feels</th>
                    <th className="text-right font-medium py-2 px-2 hidden sm:table-cell">Rain</th>
                    <th className="text-right font-medium py-2 px-2 hidden md:table-cell">Snow</th>
                    <th className="text-right font-medium py-2 px-2 hidden md:table-cell">Wind</th>
                    <th className="text-right font-medium py-2 px-2 hidden lg:table-cell">Gusts</th>
                    <th className="text-right font-medium py-2 px-2 hidden lg:table-cell">Humid</th>
                    <th className="text-right font-medium py-2 px-2 hidden lg:table-cell">Cloud</th>
                    <th className="text-right font-medium py-2 px-2 hidden xl:table-cell">Pressure</th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily.time.map((date, i) => {
                    const info = getWeatherInfo(data.daily.weatherCode[i]);
                    const Icon = getWeatherIcon(info.icon);
                    return (
                      <tr
                        key={date}
                        className="border-b border-white/5 last:border-0 hover:bg-white/5 transition cursor-pointer"
                        onClick={() => setSelectedDay(i)}
                      >
                        <td className="py-2.5 pr-4 text-white/90 font-medium">{fmtDate(date)}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1.5 justify-center text-white/80" title={info.label}>
                            <Icon className="h-4 w-4" />
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right text-white font-medium">{Math.round(data.daily.temperatureMax[i])}°</td>
                        <td className="py-2.5 px-2 text-right text-white/60">{Math.round(data.daily.temperatureMin[i])}°</td>
                        <td className="py-2.5 px-2 text-right text-white/60 hidden sm:table-cell">
                          {Math.round(data.daily.apparentTempMin[i])}°–{Math.round(data.daily.apparentTempMax[i])}°
                        </td>
                        <td className="py-2.5 px-2 text-right text-sky-200 hidden sm:table-cell">
                          {data.daily.precipitationSum[i]?.toFixed(1) ?? '0'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-white/60 hidden md:table-cell">
                          {data.daily.snowfallSum[i]?.toFixed(1) ?? '0'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-white/60 hidden md:table-cell">
                          {Math.round(data.daily.windSpeedMax[i])} {windDirLabel(data.daily.windDirectionDominant[i] ?? 0)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-white/60 hidden lg:table-cell">
                          {Math.round(data.daily.windGustsMax[i])}
                        </td>
                        <td className="py-2.5 px-2 text-right text-white/60 hidden lg:table-cell">
                          {Math.round(data.daily.humidityMean[i])}%
                        </td>
                        <td className="py-2.5 px-2 text-right text-white/60 hidden lg:table-cell">
                          {Math.round(data.daily.cloudCoverMean[i])}%
                        </td>
                        <td className="py-2.5 px-2 text-right text-white/60 hidden xl:table-cell">
                          {Math.round(data.daily.pressureMean[i])}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Day detail drawer */}
      {data && selectedDay !== null && (
        <DayDetailDrawer
          data={data}
          index={selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-white/10 backdrop-blur-md p-3 ring-1 ring-white/15">
      <div className="flex items-center gap-1.5 text-white/60">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-base font-semibold ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

function DayDetailDrawer({
  data,
  index,
  onClose,
}: {
  data: HistoricalWeather;
  index: number;
  onClose: () => void;
}) {
  const d = data.daily;
  const date = d.time[index];
  const info = getWeatherInfo(d.weatherCode[index]);
  const Icon = getWeatherIcon(info.icon);

  const rows: { label: string; value: string; icon: typeof Calendar }[] = [
    { label: 'High Temperature', value: `${Math.round(d.temperatureMax[index])} ${data.units.temperature}`, icon: Thermometer },
    { label: 'Low Temperature', value: `${Math.round(d.temperatureMin[index])} ${data.units.temperature}`, icon: Thermometer },
    { label: 'Mean Temperature', value: `${Math.round(d.temperatureMean[index])} ${data.units.temperature}`, icon: Thermometer },
    { label: 'Feels Like (High)', value: `${Math.round(d.apparentTempMax[index])} ${data.units.apparentTemperature}`, icon: Thermometer },
    { label: 'Feels Like (Low)', value: `${Math.round(d.apparentTempMin[index])} ${data.units.apparentTemperature}`, icon: Thermometer },
    { label: 'Sunrise', value: fmtTime(d.sunrise[index]), icon: Sunrise },
    { label: 'Sunset', value: fmtTime(d.sunset[index]), icon: Sunset },
    { label: 'Daylight Duration', value: fmtDuration(d.daylightDuration[index]), icon: Sun },
    { label: 'Sunshine Duration', value: fmtDuration(d.sunshineDuration[index]), icon: Sun },
    { label: 'Total Precipitation', value: `${(d.precipitationSum[index] ?? 0).toFixed(1)} ${data.units.precipitation}`, icon: Droplets },
    { label: 'Rain', value: `${(d.rainSum[index] ?? 0).toFixed(1)} ${data.units.rain}`, icon: Droplets },
    { label: 'Showers', value: `${(d.showersSum[index] ?? 0).toFixed(1)} ${data.units.rain}`, icon: Droplets },
    { label: 'Snowfall', value: `${(d.snowfallSum[index] ?? 0).toFixed(1)} ${data.units.snowfall}`, icon: Snowflake },
    { label: 'Precipitation Hours', value: `${(d.precipitationHours[index] ?? 0).toFixed(1)} ${data.units.precipitationHours}`, icon: Droplets },
    { label: 'Max Wind Speed', value: `${Math.round(d.windSpeedMax[index])} ${data.units.windSpeed} ${windDirLabel(d.windDirectionDominant[index] ?? 0)}`, icon: Wind },
    { label: 'Max Wind Gusts', value: `${Math.round(d.windGustsMax[index])} ${data.units.windGusts}`, icon: Zap },
    { label: 'Wind Direction', value: `${Math.round(d.windDirectionDominant[index] ?? 0)}° ${windDirLabel(d.windDirectionDominant[index] ?? 0)}`, icon: Compass },
    { label: 'Avg Humidity', value: `${Math.round(d.humidityMean[index])}%`, icon: Gauge },
    { label: 'Max Humidity', value: `${Math.round(d.humidityMax[index])}%`, icon: Gauge },
    { label: 'Min Humidity', value: `${Math.round(d.humidityMin[index])}%`, icon: Gauge },
    { label: 'Avg Pressure', value: `${Math.round(d.pressureMean[index])} ${data.units.pressure}`, icon: Gauge },
    { label: 'Max Pressure', value: `${Math.round(d.pressureMax[index])} ${data.units.pressure}`, icon: Gauge },
    { label: 'Min Pressure', value: `${Math.round(d.pressureMin[index])} ${data.units.pressure}`, icon: Gauge },
    { label: 'Avg Cloud Cover', value: `${Math.round(d.cloudCoverMean[index])}%`, icon: Cloud },
    { label: 'Avg Dew Point', value: `${Math.round(d.dewpointMean[index])} ${data.units.dewpoint}`, icon: Droplets },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-md h-full bg-slate-900/95 backdrop-blur-xl overflow-y-auto scrollbar-hide shadow-2xl animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">{fmtDate(date)}</h3>
              <p className="text-white/50 text-xs">{info.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Detail rows */}
        <div className="px-5 py-4 flex flex-col gap-1">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2.5 text-white/60">
                <row.icon className="h-4 w-4" />
                <span className="text-sm">{row.label}</span>
              </div>
              <span className="text-sm font-medium text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
