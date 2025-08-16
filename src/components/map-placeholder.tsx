'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Bus as BusType, Route } from '@/lib/types';

interface MapPlaceholderProps {
  buses: BusType[];
  routes: Route[];
}

export function MapPlaceholder({ buses, routes }: MapPlaceholderProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  // Inicializa el mapa
  useEffect(() => {
    if (mapContainer.current && !map) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
      const initMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.7813, 10.9685], // Bogotá
        zoom: 12,
      });
      setMap(initMap);
    }
  }, [map]);

  // Actualiza marcadores de buses
  useEffect(() => {
    if (!map) return;

    // Limpia marcadores anteriores
    markers.forEach(marker => marker.remove());
    const newMarkers: mapboxgl.Marker[] = [];

    buses.forEach(bus => {
      const el = document.createElement('div');
      el.className = 'bg-primary rounded-full w-5 h-5 cursor-pointer animate-pulse';
      el.addEventListener('click', () => setSelectedBus(bus));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([bus.lng, bus.lat])
        .addTo(map);

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [buses, map]);

  return (
    <TooltipProvider>
      <div className="relative w-full h-[450px] md:h-[600px] rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Popup de bus seleccionado */}
        {selectedBus && (
          <div className="absolute top-10 left-10 bg-background/90 p-3 rounded-lg shadow-lg z-10">
            <strong>Bus ID: {selectedBus.id}</strong>
            <p>Ruta: {routes.find(r => r.id === selectedBus.routeId)?.name}</p>
            <p>Estado: {selectedBus.status}</p>
          </div>
        )}

        {/* Info general */}
        {/* <div className="absolute top-4 left-4 bg-background/80 p-3 rounded-lg shadow-md max-w-sm z-10">
          <h3 className="text-lg font-bold font-headline text-foreground">Visualización de Rutas</h3>
          <p className="text-xs text-muted-foreground">
            Mapa interactivo de Mapbox mostrando la ubicación de buses en tiempo real.
            Para que funcione, asegúrate de tener tu API Key en `.env.local` como <code>NEXT_PUBLIC_MAPBOX_TOKEN</code>.
          </p>
        </div> */}
      </div>
    </TooltipProvider>
  );
}
