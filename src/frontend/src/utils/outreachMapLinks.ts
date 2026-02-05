/**
 * Utility functions for generating external map links (Google Maps, Apple Maps)
 * for outreach locations with coordinates.
 */

export interface MapLinkOptions {
  latitude: number;
  longitude: number;
  label?: string;
}

/**
 * Generate a Google Maps URL for the given coordinates
 */
export function getGoogleMapsUrl({ latitude, longitude, label }: MapLinkOptions): string {
  const query = label 
    ? encodeURIComponent(`${label} @${latitude},${longitude}`)
    : `${latitude},${longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Generate an Apple Maps URL for the given coordinates
 */
export function getAppleMapsUrl({ latitude, longitude, label }: MapLinkOptions): string {
  const query = label 
    ? encodeURIComponent(label)
    : 'Location';
  return `https://maps.apple.com/?q=${query}&ll=${latitude},${longitude}`;
}

/**
 * Open a map URL in a new tab with security attributes
 */
export function openMapLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
