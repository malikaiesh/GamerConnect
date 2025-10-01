interface AnimatedRoomBackgroundProps {
  children: React.ReactNode;
}

export function AnimatedRoomBackground({ children }: AnimatedRoomBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-black">
      {children}
    </div>
  );
}
