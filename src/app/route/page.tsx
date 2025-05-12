
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Map, Hospital as HospitalIcon, Phone, Clock, TrafficCone, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { RouteInfo, Hospital, UserLocation, EmergencyCategory } from "@/lib/types";
import { Chatbot } from "@/components/Chatbot";
import { SosButton } from "@/components/SosButton";
import { useToast } from "@/hooks/use-toast";

// --- Simulation Data ---
const SIMULATED_HOSPITALS: Hospital[] = [
  { id: 'hosp1', name: 'City General Hospital', address: '123 Main St, Cityville', phone: '555-1234', latitude: 34.0522, longitude: -118.2437 },
  { id: 'hosp2', name: 'St. Luke\'s Medical Center', address: '456 Oak Ave, Cityville', phone: '555-5678', latitude: 34.0580, longitude: -118.2500 },
  { id: 'hosp3', name: 'County Urgent Care', address: '789 Pine Rd, Suburbia', phone: '555-9101', latitude: 34.0450, longitude: -118.2300 },
];

const simulateRouteCalculation = async (location: UserLocation, emergencyType: EmergencyCategory): Promise<RouteInfo[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate finding nearest hospitals and calculating routes
  // In a real app: Use location coords/address with Google Places/Maps API
  // and a routing service (Google Directions, TomTom) with traffic data.
  // The A* algorithm would be part of the routing service or backend logic.

  // Basic simulation: return predefined routes based loosely on IDs
  const routes: RouteInfo[] = [
    { id: 'route1', hospital: SIMULATED_HOSPITALS[0], distance: '3.2 km', time: '8 mins', trafficStatus: 'Light traffic', isPrimary: true },
    { id: 'route2', hospital: SIMULATED_HOSPITALS[1], distance: '4.1 km', time: '10 mins', trafficStatus: 'Moderate traffic', isPrimary: false },
    { id: 'route3', hospital: SIMULATED_HOSPITALS[2], distance: '5.5 km', time: '12 mins', trafficStatus: 'Light traffic', isPrimary: false },
  ];

   // Simulate no routes found scenario
   // if (Math.random() > 0.8) return [];

  return routes;
};

// Placeholder for Map Component
const RouteMapPlaceholder = ({ routes, userLocation }: { routes: RouteInfo[], userLocation: UserLocation | null }) => (
  <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground shadow-inner mb-6">
    <Map className="w-16 h-16 mb-2" />
    <span>(Route Map Placeholder)</span>
    {userLocation?.latitude && userLocation.longitude && (
         <span className="text-xs mt-1">User: {userLocation.latitude.toFixed(3)}, {userLocation.longitude.toFixed(3)}</span>
    )}
    {userLocation?.address && !userLocation.latitude && (
         <span className="text-xs mt-1">User Address: {userLocation.address}</span>
    )}
     {routes.length > 0 && (
        <span className="text-xs mt-1">Primary Route to: {routes[0].hospital.name}</span>
     )}
  </div>
);
// --- End Simulation ---

export default function RoutePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [routes, setRoutes] = React.useState<RouteInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [userLocation, setUserLocation] = React.useState<UserLocation | null>(null);
  const [emergencyType, setEmergencyType] = React.useState<EmergencyCategory | null>(null);

  React.useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const address = searchParams.get('address');
    const type = searchParams.get('emergencyType') as EmergencyCategory;

    if (!type) {
      setError("Emergency type is missing.");
      setIsLoading(false);
       toast({ title: "Error", description: "Emergency type missing. Please go back.", variant: "destructive"});
      return;
    }
    setEmergencyType(type);

    let locationData: UserLocation | null = null;
    if (lat && lng) {
      locationData = { latitude: parseFloat(lat), longitude: parseFloat(lng), address: address || `Coords: ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}` };
    } else if (address) {
      locationData = { latitude: null, longitude: null, address: address };
    }

    if (!locationData) {
      setError("User location is missing.");
      setIsLoading(false);
       toast({ title: "Error", description: "Location missing. Please go back.", variant: "destructive"});
      return;
    }
    setUserLocation(locationData);

    const fetchRoutes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const calculatedRoutes = await simulateRouteCalculation(locationData!, type);
         if (calculatedRoutes.length === 0) {
            setError("Could not find any nearby medical facilities or routes.");
            toast({ title: "No Routes", description: "Could not find routes. Try expanding search or checking location.", variant: "destructive"});
         }
        setRoutes(calculatedRoutes);
      } catch (err) {
        console.error("Route calculation error:", err);
        setError("Failed to calculate routes. Please try again later.");
        toast({ title: "Routing Error", description: "Failed to calculate routes.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, [searchParams, toast]); // Dependency on searchParams ensures re-fetch if URL changes

  const primaryRoute = routes.find(r => r.isPrimary);
  const alternativeRoutes = routes.filter(r => !r.isPrimary);

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
       toast({ title: "Calling...", description: `Dialing ${phoneNumber}`});
    } else {
       toast({ title: "No Phone Number", description: "Phone number not available for this facility.", variant: "destructive"});
    }
  };

   const handleNavigate = (hospital: Hospital) => {
      // Open Google Maps or other navigation app
      // Use hospital coordinates or address
      const destination = hospital.latitude && hospital.longitude
        ? `${hospital.latitude},${hospital.longitude}`
        : encodeURIComponent(hospital.address);
       const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      window.open(url, '_blank');
       toast({ title: "Opening Navigation", description: `Starting route to ${hospital.name}`});
   }


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Calculating fastest routes...</p>
         <p className="text-sm text-muted-foreground mt-2">Finding help for '{emergencyType || 'your emergency'}' near {userLocation?.address || 'your location'}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-xl text-red-600">{error}</p>
        <Button onClick={() => router.back()} className="mt-6">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
       <header className="mb-6 text-center">
         <h1 className="text-3xl md:text-4xl font-bold text-primary mb-1">Fastest Route to Help</h1>
         <p className="text-lg text-muted-foreground">For '{emergencyType}' Emergency</p>
      </header>

      {/* Map Placeholder */}
      <RouteMapPlaceholder routes={routes} userLocation={userLocation} />

      {/* Primary Route */}
      {primaryRoute && (
        <Card className="mb-6 border-2 border-primary shadow-lg bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center justify-between">
              <span>Primary Route</span>
               <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">Fastest</span>
            </CardTitle>
            <div className="flex items-center gap-2 pt-1 text-lg font-semibold">
                 <HospitalIcon className="w-5 h-5 text-foreground/80" />
                 <span>{primaryRoute.hospital.name}</span>
             </div>
             <CardDescription>{primaryRoute.hospital.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Est. Time: <strong>{primaryRoute.time}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                 <ArrowRight className="w-4 h-4 text-muted-foreground" />
                 <span>Distance: <strong>{primaryRoute.distance}</strong></span>
              </div>
            </div>
             <div className="flex items-center gap-2 text-sm">
              <TrafficCone className="w-4 h-4 text-muted-foreground" />
              <span>Traffic: {primaryRoute.trafficStatus || 'Not available'}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button onClick={() => handleNavigate(primaryRoute.hospital)} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                 <Map className="w-4 h-4 mr-2" /> Start Navigation
              </Button>
               <Button onClick={() => handleCall(primaryRoute.hospital.phone)} variant="outline" className="flex-1">
                 <Phone className="w-4 h-4 mr-2" /> Call Facility
               </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Routes */}
      {alternativeRoutes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-center sm:text-left">Alternative Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternativeRoutes.map((route) => (
              <Card key={route.id} className="bg-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                   <CardTitle className="text-lg flex items-center gap-2">
                     <HospitalIcon className="w-5 h-5 text-foreground/70" />
                     {route.hospital.name}
                   </CardTitle>
                   <CardDescription className="text-xs">{route.hospital.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                   <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Est. Time: <strong>{route.time}</strong></span>
                   </div>
                   <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>Distance: <strong>{route.distance}</strong></span>
                   </div>
                   <div className="flex items-center gap-2">
                    <TrafficCone className="w-3 h-3 text-muted-foreground" />
                    <span>Traffic: {route.trafficStatus || 'N/A'}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleNavigate(route.hospital)} size="sm" variant="secondary" className="flex-1 text-xs">
                         <Map className="w-3 h-3 mr-1" /> Navigate
                    </Button>
                    <Button onClick={() => handleCall(route.hospital.phone)} size="sm" variant="ghost" className="flex-1 text-xs">
                       <Phone className="w-3 h-3 mr-1" /> Call
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

       {/* Chatbot Trigger */}
       {emergencyType && (
         <div className="mt-8 flex justify-center">
            <Chatbot emergencyType={emergencyType} />
          </div>
       )}


       {/* SOS Button */}
       {userLocation && <SosButton userLocation={userLocation} />}
    </div>
  );
}
