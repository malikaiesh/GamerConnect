import { useState, useEffect } from 'react';
import { PushNotification as PushNotificationType } from '@shared/schema';

interface PushNotificationProps {
  notification: PushNotificationType;
  onClose: () => void;
  onAction: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export function PushNotification({
  notification,
  onClose,
  onAction,
  autoClose = true,
  autoCloseTime = 8000
}: PushNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Fade in effect
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Auto close timer
    let timer: number;
    if (autoClose) {
      timer = window.setTimeout(() => {
        handleClose();
      }, autoCloseTime);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  const handleAction = () => {
    onAction();
    handleClose();
  };
  
  // Styles based on notification type
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'alert':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 max-w-sm w-full';
      case 'banner':
        return 'fixed top-0 left-0 right-0 w-full';
      case 'modal':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full z-50';
      case 'slide-in':
        return 'fixed top-4 right-4 max-w-sm';
      case 'toast':
      default:
        return 'fixed bottom-4 right-4 max-w-sm';
    }
  };
  
  return (
    <div 
      className={`
        ${getTypeStyles()} 
        bg-card rounded-lg shadow-lg p-4 flex items-start transition-all duration-300
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : notification.type === 'toast' || notification.type === 'slide-in'
            ? 'opacity-0 translate-y-full'
            : notification.type === 'modal'
              ? 'opacity-0 scale-95'
              : 'opacity-0'
        }
        z-50
      `}
    >
      {notification.image && (
        <div className="flex-shrink-0 mr-4">
          <img 
            src={notification.image} 
            alt="Notification" 
            className="w-12 h-12 rounded-md object-cover"
          />
        </div>
      )}
      
      <div className="flex-1">
        <h4 className="font-bold text-foreground text-sm">{notification.title}</h4>
        <p className="text-muted-foreground text-xs mb-2">{notification.message}</p>
        
        <div className="flex space-x-2">
          {notification.link && (
            <button 
              onClick={handleAction}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded text-xs transition-colors"
            >
              Check it Out
            </button>
          )}
          <button 
            onClick={handleClose}
            className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1 rounded text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
      
      <button 
        className="ml-2 text-muted-foreground hover:text-foreground" 
        onClick={handleClose}
      >
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
}
