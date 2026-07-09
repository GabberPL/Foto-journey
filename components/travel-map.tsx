"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGoogleMaps } from '@/lib/google-maps';
import { getCountryCoordinates, MAP_STYLES } from '@/lib/map-data';
import type { CountryMarker } from '@/lib/types';

type TravelMapProps = {
  markers: CountryMarker[];
  className?: string;
  /** Gdy true, klik w pin przenosi do /galeria?kraj=… */
  navigateOnClick?: boolean;
  showZoomControl?: boolean;
};

export default function TravelMap({
  markers,
  className = '',
  navigateOnClick = true,
  showZoomControl = true,
}: TravelMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    loadGoogleMaps()
      .then((googleMaps) => {
        if (cancelled || !mapRef.current) return;

        const map = new googleMaps.Map(mapRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          draggable: true,
          scrollwheel: false,
          disableDefaultUI: true,
          zoomControl: showZoomControl,
          gestureHandling: 'cooperative',
          disableDoubleClickZoom: true,
          styles: MAP_STYLES,
        });

        const bounds = new googleMaps.LatLngBounds();
        let hasMarkers = false;

        markers.forEach(({ country, count }) => {
          const coordinates = getCountryCoordinates(country);
          if (!coordinates) return;
          hasMarkers = true;

          const marker = new googleMaps.Marker({
            position: coordinates,
            map,
            title: count > 0 ? `${country} · ${count} zdjęć` : country,
            label: count > 1
              ? { text: String(count), color: '#050505', fontSize: '10px', fontWeight: '700' }
              : undefined,
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: count > 1 ? 10 : 7,
              fillColor: '#EAB308',
              fillOpacity: 1,
              strokeColor: '#050505',
              strokeWeight: 2,
            },
          });

          if (navigateOnClick) {
            marker.addListener('click', () => {
              routerRef.current.push(`/galeria?kraj=${encodeURIComponent(country)}`);
            });
          }
          bounds.extend(coordinates);
        });

        if (hasMarkers) {
          map.fitBounds(bounds, 80);
          googleMaps.event.addListenerOnce(map, 'idle', () => {
            if (map.getZoom() > 6) map.setZoom(6);
          });
        } else {
          map.setCenter({ lat: 20, lng: 0 });
          map.setZoom(2);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setMapError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [markers, navigateOnClick, showZoomControl]);

  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${className}`}>
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      {mapError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/90 px-6">
          <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900/90 px-6 py-4 text-center text-sm text-zinc-400">
            {mapError}
          </div>
        </div>
      ) : null}
    </div>
  );
}
