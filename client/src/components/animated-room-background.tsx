interface AnimatedRoomBackgroundProps {
  children: React.ReactNode;
}

export function AnimatedRoomBackground({ children }: AnimatedRoomBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated gradient circles with CSS-only animations */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Main large circle with rotating gradient */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-spin-slow"
          style={{
            background: `conic-gradient(from 0deg, 
              #3b82f6 0deg, 
              #8b5cf6 60deg, 
              #10b981 120deg, 
              #eab308 180deg, 
              #f59e0b 240deg, 
              #ef4444 300deg, 
              #3b82f6 360deg)`,
            filter: "blur(60px)",
            opacity: 0.6,
            willChange: "transform",
            contain: "paint",
          }}
        />
        
        {/* Inner circle for more depth - counter-rotating */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-spin-reverse"
          style={{
            background: `conic-gradient(from 0deg, 
              #06b6d4 0deg, 
              #8b5cf6 90deg, 
              #ec4899 180deg, 
              #f97316 270deg, 
              #06b6d4 360deg)`,
            filter: "blur(50px)",
            opacity: 0.5,
            willChange: "transform",
            contain: "paint",
          }}
        />
        
        {/* Smaller rotating orb - faster rotation */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full animate-spin-faster"
          style={{
            background: `conic-gradient(from 0deg, 
              #a855f7 0deg, 
              #3b82f6 120deg, 
              #10b981 240deg, 
              #a855f7 360deg)`,
            filter: "blur(40px)",
            opacity: 0.4,
            willChange: "transform",
            contain: "paint",
          }}
        />
      </div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
