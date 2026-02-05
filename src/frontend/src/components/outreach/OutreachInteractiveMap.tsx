import { MapPin, ExternalLink, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getGoogleMapsUrl, getAppleMapsUrl, openMapLink } from '@/utils/outreachMapLinks';
import type { Coordinates } from '../../backend';
import { useState } from 'react';

export interface MapMarker {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: 'institution' | 'area' | 'camp' | 'reported';
  metadata?: {
    status?: string;
    description?: string;
    [key: string]: any;
  };
}

interface OutreachInteractiveMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
}

export default function OutreachInteractiveMap({ markers, onMarkerClick }: OutreachInteractiveMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);

  // Filter out markers with default/invalid coordinates
  const validMarkers = markers.filter(
    m => m.coordinates.latitude !== 0 || m.coordinates.longitude !== 0
  );

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'institution': return 'bg-blue-500';
      case 'area': return 'bg-green-500';
      case 'camp': return 'bg-purple-500';
      case 'reported': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMarkerIcon = (type: string) => {
    return '/assets/generated/map-marker.dim_32x32.png';
  };

  if (validMarkers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="w-16 h-16 mb-4 opacity-50 mx-auto" />
          <p className="text-muted-foreground">No locations with coordinates available yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add coordinates to outreach items to see them on the map
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Interactive Outreach Map
              </CardTitle>
              <CardDescription>
                {validMarkers.length} location{validMarkers.length !== 1 ? 's' : ''} with coordinates
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSatellite(!showSatellite)}
            >
              <Layers className="w-4 h-4 mr-2" />
              {showSatellite ? 'Standard' : 'Satellite'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simplified map visualization - shows markers in a grid layout */}
          <div className={`relative rounded-lg overflow-hidden min-h-[500px] ${
            showSatellite 
              ? 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800' 
              : 'bg-gradient-to-br from-blue-100 via-green-100 to-blue-200 dark:from-gray-800 dark:to-gray-700'
          }`}>
            {/* Map grid overlay */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-px opacity-20">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-gray-400" />
              ))}
            </div>

            {/* Markers */}
            <div className="absolute inset-0 p-8">
              {validMarkers.map((marker, index) => {
                // Position markers based on coordinates (simplified visualization)
                const normalizedLat = ((marker.coordinates.latitude + 90) / 180) * 100;
                const normalizedLng = ((marker.coordinates.longitude + 180) / 360) * 100;
                
                return (
                  <button
                    key={marker.id}
                    onClick={() => handleMarkerClick(marker)}
                    className={`absolute transform -translate-x-1/2 -translate-y-full hover:scale-125 transition-transform cursor-pointer ${
                      selectedMarker?.id === marker.id ? 'scale-125 z-10' : ''
                    }`}
                    style={{
                      left: `${normalizedLng}%`,
                      top: `${100 - normalizedLat}%`,
                    }}
                    title={marker.name}
                  >
                    <div className="relative">
                      <img
                        src={getMarkerIcon(marker.type)}
                        alt={marker.name}
                        className="w-8 h-8 drop-shadow-lg"
                      />
                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${getMarkerColor(marker.type)}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
              <p className="text-xs font-semibold mb-2">Legend</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Institutions</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Monitored Areas</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Camps</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Reported Areas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected marker details */}
          {selectedMarker && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {selectedMarker.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedMarker.coordinates.latitude.toFixed(6)}, {selectedMarker.coordinates.longitude.toFixed(6)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge>{selectedMarker.type}</Badge>
                    {selectedMarker.metadata?.status && (
                      <Badge variant="outline">{selectedMarker.metadata.status}</Badge>
                    )}
                  </div>
                  
                  {selectedMarker.metadata?.description && (
                    <p className="text-sm text-muted-foreground">{selectedMarker.metadata.description}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMapLink(getGoogleMapsUrl({
                        latitude: selectedMarker.coordinates.latitude,
                        longitude: selectedMarker.coordinates.longitude,
                        label: selectedMarker.name,
                      }))}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMapLink(getAppleMapsUrl({
                        latitude: selectedMarker.coordinates.latitude,
                        longitude: selectedMarker.coordinates.longitude,
                        label: selectedMarker.name,
                      }))}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Apple Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> This is a simplified map visualization. Click "Open in Google Maps" or "Open in Apple Maps" 
          for detailed satellite imagery and navigation features.
        </AlertDescription>
      </Alert>
    </div>
  );
}
