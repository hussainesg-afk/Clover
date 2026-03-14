"use client";

import { useCallback, useMemo } from "react";
import {
  GoogleMap,
  Polyline,
  useJsApiLoader,
  OverlayViewF,
  OVERLAY_LAYER,
} from "@react-google-maps/api";
import type { SoloRoute } from "@/config/solo-routes.config";

const mapContainerStyle = {
  width: "100%",
  height: "320px",
  borderRadius: "1rem",
};

const BRISTOL_CENTRE = { lat: 51.4545, lng: -2.5879 };

interface RouteMapProps {
  routes: SoloRoute[];
  userLocation?: { lat: number; lng: number } | null;
  selectedRouteId: string | null;
}

export default function RouteMap({
  routes,
  userLocation,
  selectedRouteId,
}: RouteMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
  });

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (selectedRouteId) {
      const route = routes.find((r) => r.id === selectedRouteId);
      if (route) return { lat: route.startLat, lng: route.startLng };
    }
    if (routes.length > 0) {
      const r = routes[0];
      return { lat: r.startLat, lng: r.startLng };
    }
    return BRISTOL_CENTRE;
  }, [userLocation, selectedRouteId, routes]);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      const bounds = new google.maps.LatLngBounds();
      if (userLocation) bounds.extend(userLocation);
      routes.forEach((r) => {
        r.polyline.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      });
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    },
    [routes, userLocation]
  );

  const onUnmount = useCallback(() => {}, []);

  if (!apiKey || !isLoaded || loadError) {
    return (
      <div
        className="flex min-h-[320px] items-center justify-center rounded-2xl border border-stone-200 bg-stone-50"
        style={{ backgroundColor: "#E0E7C7" }}
      >
        <p className="text-sm text-stone-600">
          {!apiKey ? "Map unavailable (no API key)" : "Loading map…"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {userLocation && (
          <OverlayViewF
            mapPaneName={OVERLAY_LAYER}
            position={userLocation}
            getPixelPositionOffset={(w, h) => ({ x: -(w / 2), y: -h })}
          >
            <div className="rounded-lg border-2 border-teal-500 bg-teal-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              You
            </div>
          </OverlayViewF>
        )}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            path={route.polyline.map((p) => ({ lat: p.lat, lng: p.lng }))}
            options={{
              strokeColor: selectedRouteId === route.id ? "#0d9488" : "#94a3b8",
              strokeOpacity: selectedRouteId === route.id ? 1 : 0.5,
              strokeWeight: selectedRouteId === route.id ? 4 : 2,
              geodesic: true,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
