'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationPanel } from './NotificationPanel';
import { useState } from 'react';

interface NotificationButtonProps {
  userId?: string;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  userId
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
      </Button>
      
      <NotificationPanel
        userId={userId}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
};