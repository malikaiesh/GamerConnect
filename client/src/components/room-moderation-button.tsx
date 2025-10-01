import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { RoomModerationPanel } from './room-moderation-panel';

interface RoomModerationButtonProps {
  roomId: string;
  userRole: 'owner' | 'manager' | 'moderator' | 'member';
  className?: string;
}

export function RoomModerationButton({ roomId, userRole, className }: RoomModerationButtonProps) {
  const [showPanel, setShowPanel] = useState(false);

  // Only show button to users with moderation permissions
  const hasPermissions = userRole === 'owner' || userRole === 'manager' || userRole === 'moderator';

  if (!hasPermissions) {
    return null;
  }

  // Check if this is an icon-only button (used in room interface)
  const isIconOnly = className && className.includes('rounded-full');

  return (
    <>
      <Button
        variant="outline"
        size={isIconOnly ? "icon" : "sm"}
        onClick={() => setShowPanel(true)}
        className={className}
        data-testid="room-moderation-button"
      >
        <Shield className={isIconOnly ? "w-5 h-5 sm:w-6 sm:h-6" : "h-4 w-4 mr-2"} />
        {!isIconOnly && "Moderation"}
      </Button>

      <RoomModerationPanel
        roomId={roomId}
        userRole={userRole}
        isVisible={showPanel}
        onClose={() => setShowPanel(false)}
      />
    </>
  );
}