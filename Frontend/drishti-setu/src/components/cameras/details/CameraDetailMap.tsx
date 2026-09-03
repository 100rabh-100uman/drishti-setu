"use client";

import { useRef, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, ExternalLink } from "lucide-react";

interface CameraDetailMapProps {
  latitude: number;
  longitude: number;
  cameraId: string;
  address: string;
}

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm", minzoom: 0, maxzoom: 19 }],
};

export function CameraDetailMap({ latitude, longitude, cameraId, address }: CameraDetailMapProps) {
  const mapRef = useRef<any>(null);

  const isValid = !isNaN(latitude) && !isNaN(longitude) && latitude >= -90 && latitude <= 90;
  const lat = isValid ? latitude : 23.0225;
  const lng = isValid ? longitude : 72.5714;

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-slate-200 h-[280px] relative shadow-inner">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: lng,
            latitude: lat,
            zoom: 14,
          }}
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="bottom-right" showCompass={false} />

          <Marker longitude={lng} latitude={lat} anchor="bottom">
            <div className="relative flex flex-col items-center group cursor-pointer">
              {/* Pulsing ring */}
              <span className="absolute -top-1 w-6 h-6 rounded-full bg-red-500/30 animate-ping" />
              {/* Pin */}
              <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white relative z-10">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-9 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow whitespace-nowrap opacity-90">
                {cameraId}
              </div>
            </div>
          </Marker>
        </Map>

        {/* Coords Badge Overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-slate-700 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>

        {/* External Link */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200/80 p-1.5 rounded-lg text-slate-600 hover:text-blue-600 transition-colors shadow-sm"
          title="Open in Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
