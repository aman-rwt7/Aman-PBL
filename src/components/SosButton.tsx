
"use client";

import * as React from "react";
import { AlertCircle, PhoneOutgoing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { UserLocation } from "@/lib/types";

interface SosButtonProps {
  userLocation: UserLocation | null;
}

export function SosButton({ userLocation }: SosButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSosConfirm = () => {
    // Simulate sending SOS alert
    console.log("SOS Alert Triggered!");
    console.log("User Location:", userLocation);
    // In a real app, this would call an API endpoint:
    // await sendSosAlert(userLocation);
    setIsOpen(false);
    // Potentially show a success toast
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg animate-pulse"
          aria-label="SOS Alert"
        >
          <PhoneOutgoing className="h-8 w-8" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-destructive" /> Confirm SOS Alert?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately alert emergency services with your current
            location (if available). Only use this in a genuine emergency.
            <br />
            {userLocation?.latitude && userLocation?.longitude && (
              <span className="mt-2 block text-xs text-muted-foreground">
                Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </span>
            )}
             {userLocation?.address && !userLocation?.latitude && (
              <span className="mt-2 block text-xs text-muted-foreground">
                Location: {userLocation.address}
              </span>
            )}
             {!userLocation?.latitude && !userLocation?.address && (
              <span className="mt-2 block text-xs text-destructive">
                Warning: Location not detected. Alert will be sent without precise location.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSosConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Confirm SOS
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
