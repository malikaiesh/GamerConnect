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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(true)}
        className={className}
        data-testid="room-moderation-button"
      >
        <Shield className="h-4 w-4 mr-2" />
        Moderation
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