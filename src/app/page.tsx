
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { EmergencyType } from "@/lib/types";
import { AmbulanceIcon } from "@/components/icons/AmbulanceIcon";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { BrainIcon } from "@/components/icons/BrainIcon";
import { AlertTriangleIcon } from "@/components/icons/AlertTriangleIcon";
import { BabyIcon } from "@/components/icons/BabyIcon";
import { DropletIcon } from "@/components/icons/DropletIcon";
import { SosButton } from "@/components/SosButton"; // SOS button requires location, cannot be used here yet.

// Define Emergency Types with colors and icons
const emergencyTypes: EmergencyType[] = [
  { id: 'accident', label: 'Accident', icon: AmbulanceIcon, color: 'bg-red-600 hover:bg-red-700' },
  { id: 'heart', label: 'Heart Attack / Cardiac Arrest', icon: HeartIcon, color: 'bg-red-600 hover:bg-red-700' },
  { id: 'stroke', label: 'Stroke', icon: BrainIcon, color: 'bg-orange-500 hover:bg-orange-600' },
  { id: 'allergy', label: 'Severe Allergic Reaction', icon: AlertTriangleIcon, color: 'bg-yellow-500 hover:bg-yellow-600 text-black' },
  { id: 'childbirth', label: 'Childbirth', icon: BabyIcon, color: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'bleeding', label: 'Uncontrolled Bleeding', icon: DropletIcon, color: 'bg-red-600 hover:bg-red-700' },
];

export default function EmergencySelectionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-secondary/30">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">MediRoute</h1>
        <p className="text-lg md:text-xl text-foreground/80">Select the Emergency Type</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl">
        {emergencyTypes.map((emergency) => (
          <Link
            key={emergency.id}
            href={{
              pathname: '/location',
              query: { emergencyType: emergency.id },
            }}
            passHref
            legacyBehavior // Required for Button child
          >
            <Button
              variant="default"
              className={`h-24 md:h-32 w-full text-lg md:text-xl font-semibold text-primary-foreground rounded-lg shadow-md transition-transform hover:scale-105 flex flex-col items-center justify-center gap-2 ${emergency.color}`}
            >
              <emergency.icon className="w-8 h-8 md:w-10 md:h-10 mb-1" />
              <span className="text-center leading-tight">{emergency.label}</span>
            </Button>
          </Link>
        ))}
      </div>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        In case of immediate danger, always call your local emergency number first.
      </footer>
       {/* SOS Button cannot be rendered here as location is not yet determined */}
    </div>
  );
}
