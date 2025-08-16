import type { Route, Bus, Incident } from '@/lib/types';

export const routes: Route[] = [
  {
    id: 'route-1',
    name: 'Ruta 101 - Centro a Norte',
    stops: [
      { id: 'stop-1-1', name: 'Plaza Principal', lat: 4.60971, lng: -74.08175 },
      { id: 'stop-1-2', name: 'Museo del Oro', lat: 4.6018, lng: -74.0721 },
      { id: 'stop-1-3', name: 'Parque Nacional', lat: 4.621, lng: -74.067 },
      { id: 'stop-1-4', name: 'Calle 72', lat: 4.658, lng: -74.056 },
      { id: 'stop-1-5', name: 'Centro Comercial Andino', lat: 4.667, lng: -74.054 },
    ],
  },
  {
    id: 'route-2',
    name: 'Ruta 202 - Sur a Occidente',
    stops: [
      { id: 'stop-2-1', name: 'Portal Sur', lat: 4.544, lng: -74.148 },
      { id: 'stop-2-2', name: 'Estadio El Campín', lat: 4.647, lng: -74.075 },
      { id: 'stop-2-3', name: 'Jardín Botánico', lat: 4.665, lng: -74.098 },
      { id: 'stop-2-4', name: 'Aeropuerto El Dorado', lat: 4.701, lng: -74.146 },
    ],
  },
];

export const buses: Bus[] = [
  { id: 'bus-001', routeId: 'route-1', lat: 4.6395, lng: -74.0615, status: 'On Time' },
  { id: 'bus-002', routeId: 'route-2', lat: 4.656, lng: -74.0865, status: 'Delayed' },
];

export const incidents: Incident[] = [
  {
    routeId: 'route-1',
    description: 'Heavy traffic reported near Parque Nacional.',
    severity: 'medium',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    routeId: 'route-2',
    description: 'Minor accident involving a bicycle on Av. El Dorado.',
    severity: 'low',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    routeId: 'route-1',
    description: 'Protests blocking the road at Calle 72.',
    severity: 'high',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  }
];
