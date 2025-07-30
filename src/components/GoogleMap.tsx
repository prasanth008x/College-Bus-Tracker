import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  busLocation?: { lat: number; lng: number; speed?: number };
  busStops?: Array<{ name: string; lat: number; lng: number }>;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom = 15,
  busLocation,
  busStops = [],
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);
  const stopMarkersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      // TO ADD GOOGLE MAPS API KEY:
      // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key in the script src below
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDUic0Xc1Gccx7HwBJJh4VtqnVqzUc9FOo &callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key.');
        // Fallback to demo mode
        createDemoMap();
      };
      
      document.head.appendChild(script);
    };

    const createDemoMap = () => {
      // Demo map for development
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
          ">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"%23ffffff\" stroke-width=\"0.5\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>'); opacity: 0.3;"></div>
            <div style="position: relative; z-index: 1;">
              <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Live Map View</div>
              <div style="font-size: 16px; margin-bottom: 16px; opacity: 0.9;">
                Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}
              </div>
              ${busLocation ? `
                <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; margin: 8px 0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">🚌</div>
                  <div style="font-size: 14px;">Bus Location: ${busLocation.lat.toFixed(4)}, ${busLocation.lng.toFixed(4)}</div>
                  <div style="font-size: 14px;">Speed: ${busLocation.speed || 0} km/h</div>
                </div>
              ` : ''}
              <div style="font-size: 12px; opacity: 0.8; margin-top: 16px;">
                Add Google Maps API key to enable full map functionality
              </div>
            </div>
          </div>
        `;
      }
      setIsLoaded(true);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && window.google && !mapInstanceRef.current) {
      try {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add bus stops
        busStops.forEach((stop) => {
          const marker = new window.google.maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map: mapInstanceRef.current,
            title: stop.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#ff4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });
          stopMarkersRef.current.push(marker);
        });
      } catch (err) {
        setError('Error initializing map');
        console.error('Map initialization error:', err);
      }
    }
  }, [isLoaded, center, zoom, busStops]);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current && busLocation && window.google) {
      try {
        if (busMarkerRef.current) {
          busMarkerRef.current.setPosition(busLocation);
        } else {
          busMarkerRef.current = new window.google.maps.Marker({
            position: busLocation,
            map: mapInstanceRef.current,
            title: `Bus (Speed: ${busLocation.speed || 0} km/h)`,
            icon: {
              path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
              fillColor: '#4CAF50',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 1.5
            }
          });
        }
        
        // Center map on bus location
        mapInstanceRef.current.setCenter(busLocation);
      } catch (err) {
        console.error('Error updating bus location:', err);
      }
    }
  }, [isLoaded, busLocation]);

  if (error && !isLoaded) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="text-red-600 text-lg mb-2">⚠️ Map Error</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-blue-600 font-medium">Loading Live Map...</div>
          <div className="text-blue-500 text-sm mt-1">Connecting to GPS</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg border border-gray-200" />
      
      {/* Live indicator */}
      <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 shadow-md flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">LIVE</span>
      </div>
      
      {/* Speed indicator */}
      {busLocation?.speed !== undefined && (
        <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-md">
          <div className="text-xs text-gray-500">Speed</div>
          <div className="text-lg font-bold text-blue-600">{busLocation.speed} km/h</div>
        </div>
      )}
      
      {/* Location coordinates */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white rounded px-2 py-1 text-xs">
        {busLocation ? 
          `${busLocation.lat.toFixed(4)}, ${busLocation.lng.toFixed(4)}` : 
          `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
        }
      </div>
    </div>
  );
};

export default GoogleMap;