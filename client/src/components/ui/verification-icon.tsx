import { CheckCircle } from 'lucide-react';

interface VerificationIconProps {
  className?: string;
  size?: number;
}

export function VerificationIcon({ className = "", size = 16 }: VerificationIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-sm" style={{ width: size, height: size }}></div>
      <div className="relative bg-blue-500 rounded-full" style={{ padding: size > 16 ? '3px' : '2px' }}>
        <CheckCircle 
          className="text-white fill-current" 
          style={{ width: size - (size > 16 ? 6 : 4), height: size - (size > 16 ? 6 : 4) }}
          data-testid="verification-icon"
        />
      </div>
    </div>
  );
}