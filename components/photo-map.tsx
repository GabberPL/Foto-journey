"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import PhotoLightbox from './photo-lightbox';
import PhotoClusterPanel from './photo-cluster-panel';
import { loadGoogleMaps } from '@/lib/google-maps';
import { getCountryCoordinates, haversineMeters, MAP_STYLES } from '@/lib/map-data';
import type { CountryMarker, GeoCoords, SanityPhoto } from '@/lib/types';

type PhotoMapProps = {
  /** Zdjęcia z dokładną lokalizacją (coords) — pełne piny, klik otwiera lightbox lub panel wyboru. */
  photos: SanityPhoto[];
  /** Zbiorcze piny krajów dla zdjęć bez dokładnej lokalizacji — klik prowadzi do galerii. */
  countryMarkers: CountryMarker[];
  className?: string;
  showZoomControl?: boolean;
};

type PhotoSpot = {
  position: GeoCoords;
  photos: SanityPhoto[];
};

// Zdjęcia w tym promieniu traktujemy jako "to samo miejsce" — dostają jeden pin
// niezależnie od poziomu zoomu, żeby dalsze przybliżanie nigdy nie chowało kadrów za sobą.
const SAME_SPOT_METERS = 15;
// Klastry ciaśniejsze niż to prawdopodobnie i tak nie rozdzielą się przy dalszym zbliżaniu.
const TIGHT_CLUSTER_METERS = 120;

function groupPhotosBySpot(photos: SanityPhoto[]): PhotoSpot[] {
  const spots: PhotoSpot[] = [];

  photos.forEach((photo) => {
    if (!photo.coords) return;
    const coords = photo.coords;
    const existing = spots.find((spot) => haversineMeters(spot.position, coords) < SAME_SPOT_METERS);

    if (existing) {
      existing.photos.push(photo);
      const n = existing.photos.length;
      existing.position = {
        lat: existing.position.lat + (coords.lat - existing.position.lat) / n,
        lng: existing.position.lng + (coords.lng - existing.position.lng) / n,
      };
    } else {
      spots.push({ position: { lat: coords.lat, lng: coords.lng }, photos: [photo] });
    }
  });

  return spots;
}

export default function PhotoMap({
  photos,
  countryMarkers,
  className = '',
  showZoomControl = true,
}: PhotoMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<SanityPhoto[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [clusterPhotos, setClusterPhotos] = useState<SanityPhoto[] | null>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const spots = useMemo(() => groupPhotosBySpot(photos), [photos]);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    let clusterer: MarkerClusterer | null = null;

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

        // Jeden pin na miejsce — zdjęcia z tego samego punktu grupujemy z góry, więc
        // niezależnie od zoomu klik zawsze pokaże wszystkie kadry, a nie tylko wierzchni marker.
        const markerPhotosMap = new Map<google.maps.Marker, SanityPhoto[]>();

        const spotMarkers = spots.map((spot) => {
          const isMulti = spot.photos.length > 1;
          const marker = new googleMaps.Marker({
            position: spot.position,
            title: isMulti
              ? `${spot.photos.length} zdjęć w tym miejscu — kliknij, aby zobaczyć wszystkie`
              : [spot.photos[0].title, spot.photos[0].location].filter(Boolean).join(' — '),
            label: isMulti
              ? { text: String(spot.photos.length), color: '#050505', fontSize: '10px', fontWeight: '700' }
              : undefined,
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: isMulti ? 10 : 7,
              fillColor: '#EAB308',
              fillOpacity: 1,
              strokeColor: '#050505',
              strokeWeight: isMulti ? 3 : 2,
            },
          });

          marker.addListener('click', () => {
            if (isMulti) {
              setClusterPhotos(spot.photos);
            } else {
              setLightboxPhotos(spot.photos);
              setLightboxIndex(0);
            }
          });

          markerPhotosMap.set(marker, spot.photos);
          bounds.extend(marker.getPosition()!);
          hasMarkers = true;
          return marker;
        });

        if (spotMarkers.length > 0) {
          clusterer = new MarkerClusterer({
            map,
            markers: spotMarkers,
            renderer: {
              render: ({ count, position }) =>
                new googleMaps.Marker({
                  position,
                  label: { text: String(count), color: '#050505', fontSize: '11px', fontWeight: '700' },
                  title: `${count} miejsc — przybliż, aby rozdzielić`,
                  icon: {
                    path: googleMaps.SymbolPath.CIRCLE,
                    scale: 12 + Math.min(count, 20) * 0.5,
                    fillColor: '#EAB308',
                    fillOpacity: 1,
                    strokeColor: '#050505',
                    strokeWeight: 2,
                  },
                  zIndex: Number(googleMaps.Marker.MAX_ZINDEX) + count,
                }),
            },
            onClusterClick: (_event, cluster, clusterMap) => {
              const clusterBounds = cluster.bounds;
              const isTight =
                !clusterBounds ||
                haversineMeters(
                  clusterBounds.getNorthEast().toJSON(),
                  clusterBounds.getSouthWest().toJSON(),
                ) < TIGHT_CLUSTER_METERS;

              if (isTight) {
                const merged = (cluster.markers ?? []).flatMap(
                  (m) => markerPhotosMap.get(m as google.maps.Marker) ?? [],
                );
                if (merged.length > 0) {
                  setClusterPhotos(merged);
                  return;
                }
              }

              if (clusterBounds) clusterMap.fitBounds(clusterBounds);
            },
          });
        }

        // Zbiorcze piny krajów (zdjęcia bez dokładnej lokalizacji) — obrys zamiast pełnego koła
        countryMarkers.forEach(({ country, count }) => {
          const coordinates = getCountryCoordinates(country);
          if (!coordinates) return;
          hasMarkers = true;

          const marker = new googleMaps.Marker({
            position: coordinates,
            map,
            title: `${country} · ${count} zdjęć bez dokładnego pinu — kliknij, aby zobaczyć w galerii`,
            label: count > 1
              ? { text: String(count), color: '#EAB308', fontSize: '10px', fontWeight: '700' }
              : undefined,
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: count > 1 ? 10 : 7,
              fillColor: '#050505',
              fillOpacity: 0.85,
              strokeColor: '#EAB308',
              strokeWeight: 2,
            },
          });

          marker.addListener('click', () => {
            routerRef.current.push(`/galeria?kraj=${encodeURIComponent(country)}`);
          });
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
      clusterer?.clearMarkers();
    };
  }, [spots, countryMarkers, showZoomControl]);

  return (
    <>
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

      {clusterPhotos && (
        <PhotoClusterPanel
          photos={clusterPhotos}
          onSelect={(photo) => {
            setLightboxPhotos(clusterPhotos);
            setLightboxIndex(clusterPhotos.indexOf(photo));
            setClusterPhotos(null);
          }}
          onClose={() => setClusterPhotos(null)}
        />
      )}

      {lightboxPhotos && (
        <PhotoLightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxPhotos(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
