
'use client';

import Image from 'next/image';
import { Bus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Bus as BusType, Route } from '@/lib/types';

interface MapPlaceholderProps {
    buses: BusType[];
    routes: Route[];
}

// These are just approximate percentages for placing buses on a placeholder image
const busPositions = [
    { top: '30%', left: '45%' },
    { top: '65%', left: '55%' },
    { top: '50%', left: '25%' },
    { top: '20%', left: '75%' },
];


export function MapPlaceholder({ buses, routes }: MapPlaceholderProps) {
    return (
        <TooltipProvider>
            <div className="relative w-full h-[450px] md:h-[600px] bg-muted rounded-lg overflow-hidden shadow-inner">
                <Image
                    src="https://placehold.co/1200x800.png"
                    alt="Mapa de la ciudad"
                    fill
                    objectFit="cover"
                    className="opacity-30"
                    data-ai-hint="city map"
                />
                <div className="absolute top-4 left-4 bg-background/80 p-3 rounded-lg shadow-md max-w-sm">
                    <h3 className="text-lg font-bold font-headline text-foreground">Visualización de Rutas</h3>
                     <p className="text-xs text-muted-foreground">
                        Aquí se mostraría un mapa interactivo de Mapbox.
                        Para configurarlo, obtén una API Key gratuita de Mapbox y agrégala a tus variables de entorno como `NEXT_PUBLIC_MAPBOX_TOKEN`.
                     </p>
                </div>

                {buses.map((bus, index) => {
                    const route = routes.find(r => r.id === bus.routeId);
                    return (
                        <Tooltip key={bus.id} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <div
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 p-2 bg-primary rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform animate-pulse"
                                    style={{
                                      ...busPositions[index % busPositions.length],
                                      animationDelay: `${index * 150}ms`,
                                      animationDuration: '2s',
                                    }}
                                >
                                    <Bus className="h-5 w-5 text-primary-foreground" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">Bus ID: {bus.id}</p>
                                <p>Ruta: {route?.name}</p>
                                <p>Estado: {bus.status}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}
