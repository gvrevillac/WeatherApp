import {
  Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudRain,
  CloudSnow, CloudLightning, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
};

export function getWeatherIcon(name: string): LucideIcon {
  return iconMap[name] ?? Cloud;
}
