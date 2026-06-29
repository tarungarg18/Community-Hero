import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, X } from 'lucide-react';
import type { Issue, GeoLocation } from '../types';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const statusColors: Record<string, string> = {
  reported: '#f59e0b',
  verified: '#3b82f6',
  in_progress: '#8b5cf6',
  resolved: '#22c55e',
};

function makeStatusIcon(status: string) {
  const color = statusColors[status] ?? '#64748b';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function searchAddress(query: string): Promise<NominatimResult[]> {
  if (query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  return res.json();
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 15, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

interface AddressSearchProps {
  placeholder?: string;
  onSelect: (loc: GeoLocation) => void;
}

export function AddressSearch({ placeholder = 'Search location...', onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      const r = await searchAddress(val);
      setResults(r);
      setOpen(r.length > 0);
    }, 350);
  };

  const pick = (r: NominatimResult) => {
    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), address: r.display_name });
    setQuery(r.display_name.split(',').slice(0, 2).join(','));
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && (
        <ul className="absolute z-[1000] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg text-sm overflow-hidden">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-500" />
                <span className="line-clamp-1">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapClickHandler({ onLocationChange }: { onLocationChange: (loc: GeoLocation) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      const { lat, lng } = e.latlng;
      onLocationChange({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } },
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.display_name) {
            onLocationChange({ lat, lng, address: data.display_name });
          }
        })
        .catch(() => {});
    },
  });
  return null;
}

interface LocationPickerProps {
  location: GeoLocation;
  onLocationChange: (loc: GeoLocation) => void;
  height?: string;
}

export function LocationPicker({ location, onLocationChange, height = '260px' }: LocationPickerProps) {
  const [ready, setReady] = useState(false);
  const [defaultCenter, setDefaultCenter] = useState<[number, number]>([28.6139, 77.209]);

  useEffect(() => {
    setReady(true);
    if (navigator.geolocation && location.lat === 0 && location.lng === 0) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDefaultCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
      );
    }
  }, []);

  const hasPin = location.lat !== 0 || location.lng !== 0;
  const mapCenter: [number, number] = hasPin ? [location.lat, location.lng] : defaultCenter;

  return (
    <div className="space-y-3">
      <AddressSearch
        placeholder="Search by address or landmark..."
        onSelect={onLocationChange}
      />
      <p className="text-xs text-slate-400 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Or click directly on the map to drop a pin
      </p>
      {location.address && (
        <p className="text-xs text-brand-600 font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {location.address}
        </p>
      )}
      {ready && (
        <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200 cursor-crosshair">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {hasPin && <FlyTo lat={location.lat} lng={location.lng} />}
            <MapClickHandler onLocationChange={onLocationChange} />
            {hasPin && (
              <Marker position={[location.lat, location.lng]}>
                <Popup>Issue location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

interface StaticLocationMapProps {
  location: GeoLocation;
  height?: string;
}

export function StaticLocationMap({ location, height = '250px' }: StaticLocationMapProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <div className="bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm" style={{ height }}>
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lng]}>
          <Popup>{location.address || 'Issue location'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

interface IssuesMapProps {
  issues: Issue[];
  height?: string;
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = useRef({ lat: 0, lng: 0 });
  useEffect(() => {
    if (lat !== prevRef.current.lat || lng !== prevRef.current.lng) {
      prevRef.current = { lat, lng };
      map.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function IssuesMap({ issues, height = '500px' }: IssuesMapProps) {
  const [ready, setReady] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const center: [number, number] = issues.length > 0
    ? [issues[0].location.lat, issues[0].location.lng]
    : [28.6139, 77.209];

  useEffect(() => { setReady(true); }, []);

  const handleSearchSelect = useCallback((loc: GeoLocation) => {
    setFlyTarget({ lat: loc.lat, lng: loc.lng });
  }, []);

  return (
    <div className="space-y-3">
      <AddressSearch placeholder="Jump to a location..." onSelect={handleSearchSelect} />
      <div style={{ height }} className="rounded-2xl overflow-hidden border border-slate-100 shadow-md relative">
        {ready ? (
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {flyTarget && <MapFlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
            {issues.map((issue) => (
              <Marker
                key={issue.id}
                position={[issue.location.lat, issue.location.lng]}
                icon={makeStatusIcon(issue.status)}
              >
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-semibold text-slate-800">{issue.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{issue.category}</p>
                    <span
                      className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-white text-xs capitalize"
                      style={{ backgroundColor: statusColors[issue.status] ?? '#64748b' }}
                    >
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">
            Loading map...
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {Object.entries(statusColors).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {status.replace('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
