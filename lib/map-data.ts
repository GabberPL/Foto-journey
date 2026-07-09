export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Polska: { lat: 52.2297, lng: 21.0122 },
  Tajlandia: { lat: 15.8700, lng: 100.9925 },
  Kambodża: { lat: 12.5657, lng: 104.9910 },
  Kambodia: { lat: 12.5657, lng: 104.9910 },
  Cambodja: { lat: 12.5657, lng: 104.9910 },
  Niemcy: { lat: 51.1657, lng: 10.4515 },
  Francja: { lat: 46.2276, lng: 2.2137 },
  Włochy: { lat: 41.8719, lng: 12.5674 },
  Hiszpania: { lat: 40.4637, lng: -3.7492 },
  Portugalia: { lat: 39.3999, lng: -8.2245 },
  Grecja: { lat: 39.0742, lng: 21.8243 },
  Norwegia: { lat: 60.4720, lng: 8.4689 },
  Szwecja: { lat: 60.1282, lng: 18.6435 },
  Finlandia: { lat: 61.9241, lng: 25.7482 },
  Dania: { lat: 56.2639, lng: 9.5018 },
  Holandia: { lat: 52.1326, lng: 5.2913 },
  Czechy: { lat: 49.8175, lng: 15.4730 },
  Słowacja: { lat: 48.6690, lng: 19.6990 },
  Austria: { lat: 47.5162, lng: 14.5501 },
  Szwajcaria: { lat: 46.8182, lng: 8.2275 },
  Belgia: { lat: 50.5039, lng: 4.4699 },
  USA: { lat: 37.0902, lng: -95.7129 },
  Kanada: { lat: 56.1304, lng: -106.3468 },
  Japonia: { lat: 36.2048, lng: 138.2529 },
  Korea: { lat: 35.9078, lng: 127.7669 },
  Chiny: { lat: 35.8617, lng: 104.1954 },
  Indie: { lat: 20.5937, lng: 78.9629 },
  Nepal: { lat: 28.3949, lng: 84.1240 },
  Maroko: { lat: 31.7917, lng: -7.0926 },
  Egipt: { lat: 26.8206, lng: 30.8025 },
  Izrael: { lat: 31.0461, lng: 34.8516 },
  ArabiaSaudyjska: { lat: 23.8859, lng: 45.0792 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  NowaZelandia: { lat: -40.9006, lng: 174.8860 },
  Wietnam: { lat: 14.0583, lng: 108.2772 },
  Laos: { lat: 19.8563, lng: 102.4955 },
  Malezja: { lat: 4.2105, lng: 101.9758 },
  Indonezja: { lat: -0.7893, lng: 113.9213 },
  Filipiny: { lat: 12.8797, lng: 121.7740 },
  Turcja: { lat: 38.9637, lng: 35.2433 },
  Chorwacja: { lat: 45.1000, lng: 15.2000 },
  Ukraina: { lat: 48.3794, lng: 31.1656 },
  Litwa: { lat: 55.1694, lng: 23.8813 },
  Łotwa: { lat: 56.8796, lng: 24.6032 },
  Estonia: { lat: 58.5953, lng: 25.0136 },
  Węgry: { lat: 47.1625, lng: 19.5033 },
  Rumunia: { lat: 45.9432, lng: 24.9668 },
  Bułgaria: { lat: 42.7339, lng: 25.4858 },
  Islandia: { lat: 64.9631, lng: -19.0208 },
  Irlandia: { lat: 53.4129, lng: -8.2439 },
  'Wielka Brytania': { lat: 55.3781, lng: -3.4360 },
  Meksyk: { lat: 23.6345, lng: -102.5528 },
  Brazylia: { lat: -14.2350, lng: -51.9253 },
  Argentyna: { lat: -38.4161, lng: -63.6167 },
  Peru: { lat: -9.1900, lng: -75.0152 },
  Gruzja: { lat: 42.3154, lng: 43.3569 },
  'Sri Lanka': { lat: 7.8731, lng: 80.7718 },
};

export const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#374151' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
];

/** Odległość Haversine w metrach między dwoma punktami lat/lng. */
export const haversineMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
  const R = 6371000;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const normalizeCountryName = (value?: string) => value?.trim().toLowerCase() ?? '';

export const getCountryCoordinates = (countryName?: string) => {
  const normalized = normalizeCountryName(countryName);
  if (!normalized) return undefined;

  const exactMatch = Object.keys(COUNTRY_COORDINATES).find(
    (key) => normalizeCountryName(key) === normalized,
  );
  if (exactMatch) {
    return COUNTRY_COORDINATES[exactMatch];
  }

  const aliasMatch = Object.entries(COUNTRY_COORDINATES).find(
    ([key]) => normalizeCountryName(key).includes(normalized) || normalized.includes(normalizeCountryName(key)),
  );
  return aliasMatch?.[1];
};
