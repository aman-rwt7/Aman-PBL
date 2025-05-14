"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Map, Hospital as HospitalIcon, Phone, Clock, TrafficCone, Loader2, AlertTriangle, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { RouteInfo, Hospital, UserLocation, EmergencyCategory } from "@/lib/types";
import { Chatbot } from "@/components/Chatbot";
import { SosButton } from "@/components/SosButton";
import { useToast } from "@/hooks/use-toast";
import React, { Suspense } from "react";

// Component implementation moved to bottom of file

const fetchNearbyHospitals = async (latitude: number, longitude: number): Promise<Hospital[]> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=10&bounded=1&viewbox=${longitude - 0.1},${latitude + 0.1},${longitude + 0.1},${latitude - 0.1}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "MediRoute/1.0 (mediroute@gmail.com)",
      "Accept-Language": "en-US,en;q=0.9"
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch nearby hospitals");
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No nearby hospitals found.");
  }

  return data.map((place: any) => ({
    id: place.place_id?.toString() || `hospital-${Math.random().toString(36).slice(2)}`,
    name: place.display_name.split(",")[0].trim(),
    address: place.display_name,
    phone: undefined,
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
  }));
};

const simulateRouteCalculation = async (location: UserLocation, emergencyType: EmergencyCategory): Promise<RouteInfo[]> => {
  if (!location.latitude || !location.longitude) {
    throw new Error("Invalid user location.");
  }

  // Fetch nearby hospitals using the Nominatim API
  const hospitals = await fetchNearbyHospitals(location.latitude, location.longitude);

  // Simulate route calculation (replace with real routing logic if needed)
  return hospitals.map((hospital, index) => ({
    id: `route${index + 1}`,
    hospital,
    distance: `${(Math.random() * 5 + 1).toFixed(1)} km`, // Simulated distance
    time: `${(Math.random() * 10 + 5).toFixed(0)} mins`, // Simulated time
    trafficStatus: "Moderate traffic", // Simulated traffic
    isPrimary: index === 0, // Mark the first hospital as the primary route
  }));
};

// Placeholder for Map Component
const RouteMapPlaceholder = ({ routes, userLocation }: { routes: RouteInfo[], userLocation: UserLocation | null }) => (
  <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground shadow-inner mb-6" data-ai-hint="map placeholder">
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

const generateRouteSummaryText = (routesData: RouteInfo[], emergencyTypeData: EmergencyCategory | null, userLocationData: UserLocation | null): string => {
  let summary = `MediRoute - Emergency Route Summary\n`;
  summary += `Generated: ${new Date().toLocaleString()}\n`;
  summary += `Emergency Type: ${emergencyTypeData || 'Not specified'}\n`;

  if (userLocationData) {
    const locationString = userLocationData.address
      ? userLocationData.address
      : userLocationData.latitude && userLocationData.longitude
      ? `Coordinates: ${userLocationData.latitude.toFixed(4)}, ${userLocationData.longitude.toFixed(4)}`
      : 'Unavailable';
    summary += `Your Location: ${locationString}\n`;
  } else {
    summary += `Your Location: Unavailable\n`;
  }
  summary += `========================================\n\n`;

  const primary = routesData.find(r => r.isPrimary);
  const alternatives = routesData.filter(r => !r.isPrimary);

  if (primary) {
    summary += `PRIMARY ROUTE:\n`;
    summary += `  Hospital: ${primary.hospital.name}\n`;
    summary += `  Address: ${primary.hospital.address}\n`;
    summary += `  Phone: ${primary.hospital.phone || 'N/A'}\n`;
    summary += `  Distance: ${primary.distance}\n`;
    summary += `  Est. Time: ${primary.time}\n`;
    summary += `  Traffic: ${primary.trafficStatus || 'N/A'}\n\n`;
  }

  if (alternatives.length > 0) {
    summary += `ALTERNATIVE ROUTES:\n`;
    alternatives.forEach((route, index) => {
      summary += `\nAlternative ${index + 1}:\n`;
      summary += `  Hospital: ${route.hospital.name}\n`;
      summary += `  Address: ${route.hospital.address}\n`;
      summary += `  Phone: ${route.hospital.phone || 'N/A'}\n`;
      summary += `  Distance: ${route.distance}\n`;
      summary += `  Est. Time: ${route.time}\n`;
      summary += `  Traffic: ${route.trafficStatus || 'N/A'}\n`;
    });
    summary += `\n`;
  }

  if (!primary && alternatives.length === 0) {
    summary += "No routes were found for the specified location and emergency type.\n\n";
  }

  summary += `========================================\n`;
  summary += `Disclaimer: This information is for guidance and planning purposes only. In a real emergency, always call emergency services. Verify details and prioritize safety.\n`;
  return summary;
};

export default function RoutePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading...</p>
      </div>
    }>
      <RoutePageContent />
    </Suspense>
  );
}

function RoutePageContent() {
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
      toast({ title: "Error", description: "Emergency type missing. Please go back.", variant: "destructive" });
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
      toast({ title: "Error", description: "Location missing. Please go back.", variant: "destructive" });
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
          toast({ title: "No Routes", description: "Could not find routes. Try expanding search or checking location.", variant: "destructive" });
        }
        setRoutes(calculatedRoutes);
      } catch (err) {
        console.error("Route calculation error:", err);
        setError("Failed to calculate routes. Please try again later.");
        toast({ title: "Routing Error", description: "Failed to calculate routes.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, [searchParams, toast]);

  const primaryRoute = routes.find(r => r.isPrimary);
  const alternativeRoutes = routes.filter(r => !r.isPrimary);

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
      toast({ title: "Calling...", description: `Dialing ${phoneNumber}` });
    } else {
      toast({ title: "No Phone Number", description: "Phone number not available for this facility.", variant: "destructive" });
    }
  };

  const handleNavigate = (hospital: Hospital) => {
    const destination = hospital.latitude && hospital.longitude
      ? `${hospital.latitude},${hospital.longitude}`
      : encodeURIComponent(hospital.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
    toast({ title: "Opening Navigation", description: `Starting route to ${hospital.name}` });
  };

  const handleDownloadSummary = () => {
    if (isLoading) {
      toast({ title: "Please wait", description: "Routes are still loading.", variant: "default" });
      return;
    }
    if (error && routes.length === 0) {
      toast({ title: "Error Present", description: "Cannot download summary due to an existing error and no routes available.", variant: "destructive" });
      return;
    }
    if (routes.length === 0) {
      toast({ title: "No Data", description: "No route data to download.", variant: "default" });
      return;
    }

    const summaryText = generateRouteSummaryText(routes, emergencyType, userLocation);
    const filename = `MediRoute_Summary_${emergencyType || 'Emergency'}_${new Date().toISOString().split('T')[0]}.txt`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

    toast({ title: "Download Started", description: `${filename} is downloading.` });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Calculating fastest routes...</p>
        <p className="text-sm text-muted-foreground mt-2">Finding help for '{emergencyType || 'your emergency'}' near {userLocation?.address || 'your location'}...</p>
      </div>
    );
  }

  if (error && routes.length === 0) {
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
        {error && routes.length > 0 && (
          <div className="mt-2 text-sm text-destructive/80 bg-destructive/10 p-2 rounded-md">
            Note: {error}
          </div>
        )}
      </header>

      <RouteMapPlaceholder routes={routes} userLocation={userLocation} />

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

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        {emergencyType && (
          <Chatbot emergencyType={emergencyType} />
        )}
        {!isLoading && routes.length > 0 && (
          <Button onClick={handleDownloadSummary} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Route Summary
          </Button>
        )}
      </div>

      {userLocation && <SosButton userLocation={userLocation} />}
    </div>
  );
}

