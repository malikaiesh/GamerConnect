import { BadgeCheck } from 'lucide-react';

interface VerificationIconProps {
  className?: string;
  size?: number;
}

export function VerificationIcon({ className = "", size = 16 }: VerificationIconProps) {
  return (
    <BadgeCheck 
      className={`text-blue-500 ${className}`}
      style={{ width: size, height: size }}
      data-testid="verification-icon"
    />
  );
}