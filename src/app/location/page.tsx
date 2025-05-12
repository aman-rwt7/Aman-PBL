
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, LocateFixed, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { UserLocation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { SosButton } from "@/components/SosButton";

// Placeholder for Map Component - Replace with actual implementation if needed
const MapPlaceholder = () => (
  <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
    <MapPin className="w-12 h-12" />
    <span className="ml-2">(Map Placeholder)</span>
  </div>
);

export default function LocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emergencyType = searchParams.get('emergencyType');
  const { toast } = useToast();

  const [location, setLocation] = React.useState<UserLocation>({
    latitude: null,
    longitude: null,
    address: null,
  });
  const [manualAddress, setManualAddress] = React.useState("");
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      toast({ title: "Error", description: "Geolocation not supported.", variant: "destructive" });
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: `Coords: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`, // Basic address from coords
        });
        // Optionally add reverse geocoding here to get a street address
        setIsDetecting(false);
        toast({ title: "Success", description: "Location detected automatically." });
      },
      (err) => {
        let message = "Unable to retrieve your location.";
        switch(err.code) {
            case err.PERMISSION_DENIED:
                message = "Location access denied. Please enable location services or enter manually.";
                break;
            case err.POSITION_UNAVAILABLE:
                message = "Location information is unavailable.";
                break;
            case err.TIMEOUT:
                message = "The request to get user location timed out.";
                break;
        }
        setError(message);
        setIsDetecting(false);
        toast({ title: "Error", description: message, variant: "destructive" });
      },
      { timeout: 10000 } // 10 second timeout
    );
  };

  const handleConfirmLocation = () => {
    let confirmedLocation: UserLocation;

    if (location.latitude && location.longitude) {
      confirmedLocation = location;
    } else if (manualAddress.trim()) {
       confirmedLocation = { latitude: null, longitude: null, address: manualAddress.trim() };
    } else {
      toast({ title: "Error", description: "Please detect or enter a location.", variant: "destructive" });
      return;
    }

    if (!emergencyType) {
       toast({ title: "Error", description: "Emergency type missing.", variant: "destructive" });
       // Optionally redirect back or show a more permanent error
       return;
    }

    // Navigate to the route page with parameters
    const params = new URLSearchParams();
    params.set('emergencyType', emergencyType);
    if (confirmedLocation.latitude && confirmedLocation.longitude) {
        params.set('lat', confirmedLocation.latitude.toString());
        params.set('lng', confirmedLocation.longitude.toString());
    }
    if (confirmedLocation.address) {
         params.set('address', confirmedLocation.address);
    }

    router.push(`/route?${params.toString()}`);
  };

  React.useEffect(() => {
    // Request location on initial load (optional, depending on desired UX)
    // handleDetectLocation();
  }, []); // Run once on mount

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-secondary/30">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <MapPin className="w-7 h-7" /> Emergency Location
          </CardTitle>
          <CardDescription>
            Help us find the nearest medical facility for '{emergencyType || "your emergency"}'.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto Detect Section */}
          <div className="space-y-2">
             <Label className="text-base">Detect Automatically</Label>
            <Button onClick={handleDetectLocation} disabled={isDetecting} className="w-full">
              {isDetecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="mr-2 h-4 w-4" />
              )}
              {isDetecting ? "Detecting Location..." : "Use Current Location"}
            </Button>
             {location.latitude && location.longitude && !isDetecting && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                Location Detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
             )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Manual Input Section */}
          <div className="space-y-2">
            <Label htmlFor="manual-address" className="text-base">Enter Manually</Label>
            <Input
              id="manual-address"
              type="text"
              placeholder="Enter street address, city"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              disabled={!!(location.latitude && location.longitude)} // Disable if auto-detected
            />
            {/* Map Integration Placeholder */}
            {/* <MapPlaceholder /> */}
             <p className="text-xs text-muted-foreground text-center pt-1">
                (More precise location helps find closer facilities)
             </p>
          </div>

          {/* Confirmation Button */}
          <Button
            onClick={handleConfirmLocation}
            className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={!((location.latitude && location.longitude) || manualAddress.trim())}
            >
            Confirm Location & Find Help
          </Button>
        </CardContent>
      </Card>
       {/* Render SOS button only when a location is potentially available */}
       {((location.latitude && location.longitude) || manualAddress.trim()) && (
        <SosButton userLocation={(location.latitude && location.longitude) ? location : { latitude: null, longitude: null, address: manualAddress.trim() }} />
       )}
    </div>
  );
}
