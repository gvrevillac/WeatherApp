import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, MapPin, X, LocateFixed } from 'lucide-react';
import { searchCities, reverseGeocode } from '@/lib/api';
import type { GeoLocation } from '@/types/weather';

interface SearchBarProps {
  onSelect: (location: GeoLocation) => void;
  onUseGeolocation: (location: GeoLocation) => void;
}

export function SearchBar({ onSelect, onUseGeolocation }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setOpen(true);
        setHighlight(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        onUseGeolocation(loc);
        setQuery('');
        setOpen(false);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
    );
  }, [onUseGeolocation]);

  function select(loc: GeoLocation) {
    onSelect(loc);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(results[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search city..."
            className="w-full rounded-full bg-white/15 backdrop-blur-md text-white placeholder-white/60 pl-11 pr-10 py-3 text-sm outline-none ring-1 ring-white/20 transition focus:bg-white/20 focus:ring-white/40"
            aria-label="Search for a city"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {loading && (
            <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 animate-spin" />
          )}
        </div>
        <button
          onClick={handleGeolocation}
          disabled={geoLoading}
          className="flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white p-3 ring-1 ring-white/20 transition hover:bg-white/25 disabled:opacity-50"
          aria-label="Use my location"
          title="Use my location"
        >
          {geoLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
        </button>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-80 overflow-y-auto">
          {results.map((loc, i) => (
            <li key={`${loc.id}-${i}`}>
              <button
                onMouseEnter={() => setHighlight(i)}
                onClick={() => select(loc)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  i === highlight ? 'bg-sky-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <MapPin className="h-4 w-4 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{loc.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.trim() && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-2xl ring-1 ring-black/5">
          No cities found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
