export type Route = {
  id: string;
  name: string;
  stops: Stop[];
};

export type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type Bus = {
  id: string;
  routeId: string;
  lat: number;
  lng: number;
  status: 'On Time' | 'Delayed' | 'Early';
};

export type Incident = {
  routeId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
};
