
export type EmergencyCategory =
  | 'accident'
  | 'heart'
  | 'stroke'
  | 'allergy'
  | 'childbirth'
  | 'bleeding';

export interface EmergencyType {
  id: EmergencyCategory;
  label: string;
  icon: React.ElementType | React.FC<React.SVGProps<SVGSVGElement>>; // Allow Lucide icons or custom SVGs
  color: string; // Tailwind color class or hex
}

export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  address: string | null; // Manual input or reverse geocoded
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string; // Optional phone number
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  id: string;
  hospital: Hospital;
  distance: string; // e.g., "3.2 km"
  time: string; // e.g., "8 mins"
  trafficStatus?: string; // e.g., "Moderate traffic"
  isPrimary: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}
