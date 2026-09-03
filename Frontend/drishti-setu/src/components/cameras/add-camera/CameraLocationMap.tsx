"use client";

import { useRef, useEffect, useCallback } from "react";
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, RotateCw } from "lucide-react";

interface CameraLocationMapProps {
  latitude: string;
  longitude: string;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm', minzoom: 0, maxzoom: 19 }],
};

const DEFAULT_CENTER = { longitude: 71.1924, latitude: 22.2587 };
const DEFAULT_ZOOM = 6;

export function CameraLocationMap({ latitude, longitude, onLocationSelect }: CameraLocationMapProps) {
  const mapRef = useRef<any>(null);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  // Fly to coordinates when they change
  useEffect(() => {
    if (hasValidCoords && mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 800,
      });
    }
  }, [lat, lng, hasValidCoords]);

  const handleClick = useCallback((e: any) => {
    const { lngLat } = e;
    onLocationSelect(lngLat.lat, lngLat.lng);
  }, [onLocationSelect]);

  const handleReset = useCallback(() => {
    mapRef.current?.flyTo({
      center: [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude],
      zoom: DEFAULT_ZOOM,
      duration: 800,
    });
  }, []);

  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden border border-slate-200 h-[250px] relative">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: hasValidCoords ? lng : DEFAULT_CENTER.longitude,
            latitude: hasValidCoords ? lat : DEFAULT_CENTER.latitude,
            zoom: hasValidCoords ? 14 : DEFAULT_ZOOM,
          }}
          mapStyle={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
          onClick={handleClick}
          cursor="crosshair"
        >
          {hasValidCoords && (
            <Marker longitude={lng} latitude={lat} anchor="bottom">
              <MapPin className="w-8 h-8 text-red-600 fill-red-600 drop-shadow-lg" />
            </Marker>
          )}
        </Map>

        {/* Map controls overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            title="Reset to Gujarat"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>

        {/* Instructions overlay */}
        {!hasValidCoords && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Click on the map to set location</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 pl-1">Click on the map to set camera location, or enter coordinates above</p>
    </div>
  );
}
