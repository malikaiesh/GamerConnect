import verificationIcon from '@/assets/verification-icon.png';

interface VerificationIconProps {
  className?: string;
  size?: number;
}

export function VerificationIcon({ className = "", size = 16 }: VerificationIconProps) {
  return (
    <img 
      src={verificationIcon} 
      alt="Verified" 
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      data-testid="verification-icon"
    />
  );
}