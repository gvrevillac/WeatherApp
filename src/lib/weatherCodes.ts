interface WeatherInfo {
  label: string;
  icon: string;
}

const weatherCodeMap: Record<number, WeatherInfo> = {
  0: { label: 'Clear sky', icon: 'Sun' },
  1: { label: 'Mainly clear', icon: 'Sun' },
  2: { label: 'Partly cloudy', icon: 'CloudSun' },
  3: { label: 'Overcast', icon: 'Cloud' },
  45: { label: 'Fog', icon: 'CloudFog' },
  48: { label: 'Depositing rime fog', icon: 'CloudFog' },
  51: { label: 'Light drizzle', icon: 'CloudDrizzle' },
  53: { label: 'Moderate drizzle', icon: 'CloudDrizzle' },
  55: { label: 'Dense drizzle', icon: 'CloudDrizzle' },
  56: { label: 'Light freezing drizzle', icon: 'CloudDrizzle' },
  57: { label: 'Dense freezing drizzle', icon: 'CloudDrizzle' },
  61: { label: 'Slight rain', icon: 'CloudRain' },
  63: { label: 'Moderate rain', icon: 'CloudRain' },
  65: { label: 'Heavy rain', icon: 'CloudRain' },
  66: { label: 'Light freezing rain', icon: 'CloudRain' },
  67: { label: 'Heavy freezing rain', icon: 'CloudRain' },
  71: { label: 'Slight snow', icon: 'CloudSnow' },
  73: { label: 'Moderate snow', icon: 'CloudSnow' },
  75: { label: 'Heavy snow', icon: 'CloudSnow' },
  77: { label: 'Snow grains', icon: 'CloudSnow' },
  80: { label: 'Slight rain showers', icon: 'CloudRain' },
  81: { label: 'Moderate rain showers', icon: 'CloudRain' },
  82: { label: 'Violent rain showers', icon: 'CloudRain' },
  85: { label: 'Slight snow showers', icon: 'CloudSnow' },
  86: { label: 'Heavy snow showers', icon: 'CloudSnow' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning' },
  96: { label: 'Thunderstorm with slight hail', icon: 'CloudLightning' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'CloudLightning' },
};

export function getWeatherInfo(code: number): WeatherInfo {
  return weatherCodeMap[code] ?? { label: 'Unknown', icon: 'Cloud' };
}

export function getWeatherBackground(code: number, isDay: boolean): string {
  if (code === 0 || code === 1) {
    return isDay
      ? 'from-sky-400 via-blue-500 to-blue-600'
      : 'from-slate-900 via-slate-800 to-indigo-950';
  }
  if (code === 2) {
    return isDay
      ? 'from-sky-500 via-blue-500 to-slate-600'
      : 'from-slate-900 via-slate-800 to-slate-700';
  }
  if (code === 3) {
    return isDay
      ? 'from-slate-400 via-slate-500 to-slate-600'
      : 'from-slate-900 via-slate-800 to-slate-700';
  }
  if (code === 45 || code === 48) {
    return isDay
      ? 'from-slate-300 via-slate-400 to-slate-500'
      : 'from-slate-800 via-slate-700 to-slate-600';
  }
  if (code >= 51 && code <= 67) {
    return isDay
      ? 'from-slate-500 via-blue-600 to-blue-700'
      : 'from-slate-900 via-blue-900 to-slate-800';
  }
  if (code >= 71 && code <= 77) {
    return isDay
      ? 'from-slate-300 via-blue-300 to-slate-400'
      : 'from-slate-800 via-slate-700 to-blue-900';
  }
  if (code >= 80 && code <= 82) {
    return isDay
      ? 'from-slate-600 via-blue-700 to-blue-800'
      : 'from-slate-900 via-blue-900 to-slate-800';
  }
  if (code >= 85 && code <= 86) {
    return isDay
      ? 'from-slate-400 via-slate-500 to-slate-600'
      : 'from-slate-900 via-slate-800 to-slate-700';
  }
  if (code >= 95) {
    return isDay
      ? 'from-slate-700 via-slate-800 to-slate-900'
      : 'from-slate-950 via-slate-900 to-slate-800';
  }
  return isDay
    ? 'from-sky-400 via-blue-500 to-blue-600'
    : 'from-slate-900 via-slate-800 to-indigo-950';
}
