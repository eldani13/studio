
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Bell,
  Bus,
  ArrowRight,
  Clock,
  AlertTriangle,
  Loader2,
  Share2,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPlaceholder } from '@/components/map-placeholder';
import { routes, buses as initialBuses, incidents as initialIncidents } from '@/lib/data';
import type { Route, Stop } from '@/lib/types';
import { predictETA } from '@/ai/flows/predict-eta';
import { summarizeIncidents } from '@/ai/flows/summarize-incidents';
import { useToast } from "@/hooks/use-toast";

const trackingSchema = z.object({
  route: z.string().min(1, 'Por favor seleccione una ruta.'),
  origin: z.string().min(1, 'Por favor seleccione un origen.'),
  destination: z.string().min(1, 'Por favor seleccione un destino.'),
});

export function Dashboard() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [eta, setEta] = useState<string | null>(null);
  const [etaLoading, setEtaLoading] = useState(false);
  const [incidentSummary, setIncidentSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof trackingSchema>>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      route: '',
      origin: '',
      destination: '',
    },
  });

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const stops = selectedRoute?.stops || [];

  const handleRouteSelect = (routeId: string) => {
    form.setValue('route', routeId);
    form.resetField('origin');
    form.resetField('destination');
    setSelectedRouteId(routeId);
  };
  
  const onSubmit = async (data: z.infer<typeof trackingSchema>) => {
    setIsTracking(true);
    setEtaLoading(true);
    toast({
      title: "Rastreo Activado",
      description: "Compartiendo tu ubicación en tiempo real.",
    });

    const origin = selectedRoute?.stops.find(s => s.id === data.origin);
    const destination = selectedRoute?.stops.find(s => s.id === data.destination);

    if (origin && destination) {
        try {
            const result = await predictETA({
                routeId: data.route,
                origin: origin.name,
                destination: destination.name,
                currentTime: new Date().toISOString(),
                historicalData: [
                    { timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), duration: 1800 },
                    { timestamp: new Date(Date.now() - 7200 * 1000).toISOString(), duration: 1900 },
                ]
            });
            const arrivalTime = new Date(result.predictedETA);
            setEta(`Llegada a las ${arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        } catch (error) {
            console.error("Error predicting ETA:", error);
            setEta("No se pudo calcular la ETA.");
             toast({
              variant: "destructive",
              title: "Error de IA",
              description: "No se pudo predecir la hora de llegada.",
            });
        } finally {
            setEtaLoading(false);
        }
    }
  };

  useEffect(() => {
    const fetchIncidentSummary = async () => {
        setSummaryLoading(true);
        try {
            const result = await summarizeIncidents({ incidents: initialIncidents });
            setIncidentSummary(result.summary);
        } catch (error) {
            console.error("Error summarizing incidents:", error);
            setIncidentSummary("No se pudieron resumir las incidencias.");
             toast({
              variant: "destructive",
              title: "Error de IA",
              description: "No se pudieron resumir las incidencias.",
            });
        } finally {
            setSummaryLoading(false);
        }
    };
    fetchIncidentSummary();
  }, [toast]);


  return (
    <div className="flex h-full min-h-screen w-full bg-background">
      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center gap-2 font-headline text-xl font-semibold text-primary">
                <Bus className="h-6 w-6" />
                <span>BusTracker Go</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notificaciones</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <LogOut className="h-5 w-5"/>
                    <span className="sr-only">Cerrar Sesión</span>
                </Button>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardContent className="p-0">
                 <MapPlaceholder buses={initialBuses} routes={routes} />
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <AlertTriangle className="text-accent"/>
                        Resumen de Incidencias
                    </CardTitle>
                    <CardDescription>Resumen generado por IA de las incidencias recientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {summaryLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generando resumen...</span>
                        </div>
                    ) : (
                        <p className="text-sm">{incidentSummary}</p>
                    )}
                </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">{isTracking ? 'Viaje en Progreso' : 'Iniciar Viaje'}</CardTitle>
                <CardDescription>
                  {isTracking
                    ? 'Estás compartiendo tu ubicación.'
                    : 'Selecciona tu ruta para empezar a rastrear.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isTracking ? (
                  <div className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="font-medium">{selectedRoute?.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                               <span>{form.getValues('origin') && selectedRoute?.stops.find(s => s.id === form.getValues('origin'))?.name}</span>
                               <ArrowRight className="h-4 w-4" />
                               <span>{form.getValues('destination') && selectedRoute?.stops.find(s => s.id === form.getValues('destination'))?.name}</span>
                            </p>
                        </div>
                         <Button size="icon" variant="ghost">
                            <Share2 className="h-5 w-5"/>
                         </Button>
                    </div>

                    <Card className="bg-primary/10">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Clock className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Llegada Estimada (ETA)</p>
                                {etaLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Calculando...</span>
                                    </div>
                                ) : (
                                    <p className="text-lg font-bold font-headline">{eta}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Button onClick={() => {setIsTracking(false); form.reset(); setSelectedRouteId(null);}} className="w-full" variant="outline">
                      Finalizar Viaje
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="route"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ruta</FormLabel>
                            <Select onValueChange={handleRouteSelect} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona tu ruta" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {routes.map((route) => (
                                  <SelectItem key={route.id} value={route.id}>
                                    {route.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origen</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRouteId}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona tu parada de origen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stops.map((stop) => (
                                  <SelectItem key={stop.id} value={stop.id}>
                                    {stop.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destino</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRouteId}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona tu parada de destino" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stops.map((stop) => (
                                  <SelectItem key={stop.id} value={stop.id}>
                                    {stop.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full font-headline">
                        Estoy en el bus
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
