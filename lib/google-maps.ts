type GoogleWindow = Window & {
  google?: {
    maps: any;
  };
};

let loaderPromise: Promise<any> | null = null;

/**
 * Ładuje skrypt Google Maps raz na całą aplikację i zwraca obiekt google.maps.
 * Kolejne wywołania dostają tę samą obietnicę.
 */
export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps można załadować tylko w przeglądarce.'));
  }

  const existing = (window as GoogleWindow).google?.maps;
  if (existing) return Promise.resolve(existing);

  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Brak klucza Google Maps. Uzupełnij NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, aby mapa działała.'));
      return;
    }

    const resolveWhenReady = () => {
      const maps = (window as GoogleWindow).google?.maps;
      if (maps) {
        resolve(maps);
      } else {
        reject(new Error('Nie udało się załadować Google Maps.'));
      }
    };

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      const interval = window.setInterval(() => {
        if ((window as GoogleWindow).google?.maps) {
          window.clearInterval(interval);
          resolveWhenReady();
        }
      }, 200);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolveWhenReady;
    script.onerror = () => reject(new Error('Nie udało się załadować Google Maps.'));
    document.head.appendChild(script);
  });

  return loaderPromise;
}
