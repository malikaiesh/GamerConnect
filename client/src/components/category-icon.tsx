import { 
  Swords, 
  Compass, 
  Puzzle, 
  Crown, 
  Trophy, 
  Car, 
  Gamepad2, 
  Building, 
  User, 
  Music,
  Zap,
  Target,
  Eye,
  Flame,
  Skull,
  Sword,
  Users,
  RotateCcw,
  Hammer,
  Globe,
  Spade,
  Timer,
  MousePointer,
  PartyPopper,
  Glasses,
  Smartphone,
  type LucideIcon
} from "lucide-react";

// Mapping from RemixIcon classes to Lucide React icons
const ICON_MAP: Record<string, LucideIcon> = {
  // Original categories
  'ri-sword-line': Swords,
  'ri-compass-line': Compass, 
  'ri-puzzle-line': Puzzle,
  'ri-chess-line': Crown,
  'ri-football-line': Trophy,
  'ri-car-line': Car,
  'ri-gamepad-line': Gamepad2,
  'ri-building-line': Building,
  'ri-user-2-line': User,
  'ri-music-line': Music,
  
  // New categories
  'ri-boxing-line': Zap, // Fighting
  'ri-focus-3-line': Target, // Shooting
  'ri-spy-line': Eye, // Stealth
  'ri-fire-line': Flame, // Survival
  'ri-skull-2-line': Skull, // Horror
  'ri-team-line': Users, // MOBA
  'ri-trophy-line': Trophy, // Battle Royale
  'ri-refresh-line': RotateCcw, // Roguelike
  'ri-hammer-line': Hammer, // Sandbox
  'ri-earth-line': Globe, // Open World
  'ri-honour-line': Spade, // Card/Board Games
  'ri-timer-line': Timer, // Real-Time Strategy
  'ri-mouse-line': MousePointer, // Idle/Clicker
  'ri-celebration-line': PartyPopper, // Party Games
  'ri-vr-box-line': Glasses, // VR
  'ri-ar-box-line': Smartphone, // AR
};

interface CategoryIconProps {
  iconClass?: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ iconClass, size = 24, className = "" }: CategoryIconProps) {
  // Get the icon component from the mapping, fallback to Gamepad2
  const IconComponent = iconClass ? ICON_MAP[iconClass] || Gamepad2 : Gamepad2;
  
  return (
    <IconComponent 
      size={size} 
      className={className}
    />
  );
}