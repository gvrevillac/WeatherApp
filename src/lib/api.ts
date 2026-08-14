import type { GeoLocation, WeatherResponse, HistoricalWeather, CurrentWeather, HourlyData, DailyData } from '@/types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export async function searchCities(query: string): Promise<GeoLocation[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    name: query,
    count: '8',
    language: 'en',
    format: 'json',
  });
  const res = await fetch(`${GEOCODING_URL}?${params}`);
  if (!res.ok) throw new Error('Failed to search cities');
  const data = await res.json();
  return (data.results ?? []) as GeoLocation[];
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      count: '1',
      language: 'en',
      format: 'json',
    });
    const res = await fetch(`${GEOCODING_URL}?${params}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0] as GeoLocation;
      }
    }
  } catch {
    // fall through to manual location
  }
  return {
    id: 0,
    name: 'Current Location',
    latitude: lat,
    longitude: lon,
    country: '',
    country_code: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export async function getWeather(location: GeoLocation): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'weather_code',
      'precipitation_probability',
      'wind_speed_10m',
      'is_day',
      'visibility',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  const data = await res.json();

  const nowIdx = findCurrentHourIndex(data.hourly.time);
  const uvIndex = nowIdx >= 0 ? data.hourly.uv_index[nowIdx] : 0;
  const visibility = nowIdx >= 0 ? data.hourly.visibility[nowIdx] : 10000;

  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    humidity: data.current.relative_humidity_2m,
    pressure: data.current.pressure_msl,
    precipitation: data.current.precipitation,
    cloudCover: data.current.cloud_cover,
    isDay: data.current.is_day === 1,
    uvIndex,
    visibility,
    time: data.current.time,
  };

  const hourly: HourlyData = {
    time: data.hourly.time,
    temperature: data.hourly.temperature_2m,
    weatherCode: data.hourly.weather_code,
    precipitationProbability: data.hourly.precipitation_probability,
    windSpeed: data.hourly.wind_speed_10m,
    isDay: data.hourly.is_day,
  };

  const daily: DailyData = {
    time: data.daily.time,
    weatherCode: data.daily.weather_code,
    temperatureMax: data.daily.temperature_2m_max,
    temperatureMin: data.daily.temperature_2m_min,
    precipitationProbability: data.daily.precipitation_probability_max,
    windSpeedMax: data.daily.wind_speed_10m_max,
    sunrise: data.daily.sunrise,
    sunset: data.daily.sunset,
    uvIndexMax: data.daily.uv_index_max,
  };

  return {
    current,
    hourly,
    daily,
    location,
    units: {
      temperature: data.current_units.temperature_2m,
      windSpeed: data.current_units.wind_speed_10m,
      precipitation: data.current_units.precipitation,
      pressure: data.current_units.pressure_msl,
    },
  };
}

function findCurrentHourIndex(times: string[]): number {
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 13);
  let idx = times.findIndex((t) => t.slice(0, 13) === nowStr);
  if (idx < 0) {
    const todayStr = now.toISOString().slice(0, 10);
    idx = times.findIndex((t) => t.slice(0, 10) === todayStr);
  }
  return idx >= 0 ? idx : 0;
}

export function formatHour(isoTime: string): string {
  const d = new Date(isoTime);
  return d.toLocaleTimeString([], { hour: 'numeric' });
}

export function formatDay(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00');
  return d.toLocaleDateString([], { weekday: 'short' });
}

export function formatTime(isoTime: string): string {
  const d = new Date(isoTime);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function uvLabel(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: 'Low', color: 'text-green-300' };
  if (uv < 6) return { label: 'Moderate', color: 'text-yellow-300' };
  if (uv < 8) return { label: 'High', color: 'text-orange-300' };
  if (uv < 11) return { label: 'Very High', color: 'text-red-300' };
  return { label: 'Extreme', color: 'text-fuchsia-300' };
}

export async function getHistoricalWeather(
  location: GeoLocation,
  startDate: string,
  endDate: string,
): Promise<HistoricalWeather> {
  const dailyVars = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'temperature_2m_mean',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'daylight_duration',
    'sunshine_duration',
    'precipitation_sum',
    'rain_sum',
    'showers_sum',
    'snowfall_sum',
    'precipitation_hours',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant',
    'relative_humidity_2m_mean',
    'relative_humidity_2m_max',
    'relative_humidity_2m_min',
    'pressure_msl_mean',
    'pressure_msl_max',
    'pressure_msl_min',
    'cloud_cover_mean',
    'dew_point_2m_mean',
  ];

  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    start_date: startDate,
    end_date: endDate,
    daily: dailyVars.join(','),
    timezone: 'auto',
  });

  const res = await fetch(`${ARCHIVE_URL}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch historical weather data');
  const data = await res.json();

  const d = data.daily;
  const daily: HistoricalDaily = {
    time: d.time,
    weatherCode: d.weather_code,
    temperatureMax: d.temperature_2m_max,
    temperatureMin: d.temperature_2m_min,
    temperatureMean: d.temperature_2m_mean,
    apparentTempMax: d.apparent_temperature_max,
    apparentTempMin: d.apparent_temperature_min,
    sunrise: d.sunrise,
    sunset: d.sunset,
    daylightDuration: d.daylight_duration,
    sunshineDuration: d.sunshine_duration,
    precipitationSum: d.precipitation_sum,
    rainSum: d.rain_sum,
    showersSum: d.showers_sum,
    snowfallSum: d.snowfall_sum,
    precipitationHours: d.precipitation_hours,
    windSpeedMax: d.wind_speed_10m_max,
    windGustsMax: d.wind_gusts_10m_max,
    windDirectionDominant: d.wind_direction_10m_dominant,
    humidityMean: d.relative_humidity_2m_mean,
    humidityMax: d.relative_humidity_2m_max,
    humidityMin: d.relative_humidity_2m_min,
    pressureMean: d.pressure_msl_mean,
    pressureMax: d.pressure_msl_max,
    pressureMin: d.pressure_msl_min,
    cloudCoverMean: d.cloud_cover_mean,
    dewpointMean: d.dew_point_2m_mean,
  };

  const len = daily.time.length;
  const safe = (arr: number[] | undefined): number[] => arr ?? [];
  const sum = (arr: number[] | undefined) => safe(arr).reduce((a, b) => a + (b ?? 0), 0);
  const max = (arr: number[] | undefined) => safe(arr).length ? Math.max(...safe(arr)) : 0;
  const min = (arr: number[] | undefined) => safe(arr).length ? Math.min(...safe(arr)) : 0;
  const avg = (arr: number[] | undefined) => (safe(arr).length ? sum(arr) / len : 0);

  return {
    daily,
    location,
    startDate,
    endDate,
    units: {
      temperature: data.daily_units.temperature_2m_max,
      apparentTemperature: data.daily_units.apparent_temperature_max,
      windSpeed: data.daily_units.wind_speed_10m_max,
      windGusts: data.daily_units.wind_gusts_10m_max,
      precipitation: data.daily_units.precipitation_sum,
      rain: data.daily_units.rain_sum,
      snowfall: data.daily_units.snowfall_sum,
      pressure: data.daily_units.pressure_msl_mean,
      humidity: data.daily_units.relative_humidity_2m_mean,
      cloudCover: data.daily_units.cloud_cover_mean,
      daylightDuration: data.daily_units.daylight_duration,
      sunshineDuration: data.daily_units.sunshine_duration,
      precipitationHours: data.daily_units.precipitation_hours,
      dewpoint: data.daily_units.dew_point_2m_mean,
    },
    stats: {
      tempAvg: avg(daily.temperatureMean),
      tempMax: max(daily.temperatureMax),
      tempMin: min(daily.temperatureMin),
      apparentTempMax: max(daily.apparentTempMax),
      apparentTempMin: min(daily.apparentTempMin),
      precipTotal: sum(daily.precipitationSum),
      rainTotal: sum(daily.rainSum),
      snowTotal: sum(daily.snowfallSum),
      windMax: max(daily.windSpeedMax),
      gustMax: max(daily.windGustsMax),
      humidAvg: avg(daily.humidityMean),
      pressureAvg: avg(daily.pressureMean),
      cloudAvg: avg(daily.cloudCoverMean),
      sunshineTotal: sum(daily.sunshineDuration),
    },
  };
}

export function formatDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}
