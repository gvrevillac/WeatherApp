export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  timezone: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  precipitation: number;
  cloudCover: number;
  isDay: boolean;
  uvIndex: number;
  visibility: number;
  time: string;
}

export interface HourlyData {
  time: string[];
  temperature: number[];
  weatherCode: number[];
  precipitationProbability: number[];
  windSpeed: number[];
  isDay: number[];
}

export interface DailyData {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  precipitationProbability: number[];
  windSpeedMax: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
}

export interface WeatherResponse {
  current: CurrentWeather;
  hourly: HourlyData;
  daily: DailyData;
  location: GeoLocation;
  units: {
    temperature: string;
    windSpeed: string;
    precipitation: string;
    pressure: string;
  };
}

export interface HistoricalDaily {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  temperatureMean: number[];
  apparentTempMax: number[];
  apparentTempMin: number[];
  sunrise: string[];
  sunset: string[];
  daylightDuration: number[];
  sunshineDuration: number[];
  precipitationSum: number[];
  rainSum: number[];
  showersSum: number[];
  snowfallSum: number[];
  precipitationHours: number[];
  windSpeedMax: number[];
  windGustsMax: number[];
  windDirectionDominant: number[];
  humidityMean: number[];
  humidityMax: number[];
  humidityMin: number[];
  pressureMean: number[];
  pressureMax: number[];
  pressureMin: number[];
  cloudCoverMean: number[];
  dewpointMean: number[];
}

export interface HistoricalStats {
  tempAvg: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  precipTotal: number;
  rainTotal: number;
  snowTotal: number;
  windMax: number;
  gustMax: number;
  humidAvg: number;
  pressureAvg: number;
  cloudAvg: number;
  sunshineTotal: number;
}

export interface HistoricalWeather {
  daily: HistoricalDaily;
  location: GeoLocation;
  startDate: string;
  endDate: string;
  units: {
    temperature: string;
    apparentTemperature: string;
    windSpeed: string;
    windGusts: string;
    precipitation: string;
    rain: string;
    snowfall: string;
    pressure: string;
    humidity: string;
    cloudCover: string;
    daylightDuration: string;
    sunshineDuration: string;
    precipitationHours: string;
    dewpoint: string;
  };
  stats: HistoricalStats;
}
