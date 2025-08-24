'use client';

import { Bell, X, CheckCircle, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';
import { ComplaintNotification } from '@/lib/socket';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationPanelProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: ComplaintNotification['type']) => {
  switch (type) {
    case 'NEW_COMPLAINT':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'STATUS_UPDATE':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case 'RESPONSE_RECEIVED':
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'RESOLVED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: ComplaintNotification['type']) => {
  switch (type) {
    case 'NEW_COMPLAINT':
      return 'bg-blue-50 border-blue-200';
    case 'STATUS_UPDATE':
      return 'bg-orange-50 border-orange-200';
    case 'RESPONSE_RECEIVED':
      return 'bg-purple-50 border-purple-200';
    case 'RESOLVED':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const {
    notifications,
    unreadCount,
    isConnected,
    markNotificationsAsRead,
    clearNotifications
  } = useWebSocketNotifications({
    userId,
    onNotification: (notification) => {
      // Handle incoming notifications
      console.log('New notification:', notification);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-16 z-50 w-96 max-h-96 bg-white rounded-lg shadow-lg border">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={`${notification.complaintId}-${index}`}
                    className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.type === 'NEW_COMPLAINT' && 'Nova Reclamação'}
                            {notification.type === 'STATUS_UPDATE' && 'Atualização de Status'}
                            {notification.type === 'RESPONSE_RECEIVED' && 'Resposta Recebida'}
                            {notification.type === 'RESOLVED' && 'Reclamação Resolvida'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="text-xs text-gray-600 space-y-1">
                            {notification.data.status && (
                              <p>Status: {notification.data.status}</p>
                            )}
                            {notification.data.response && (
                              <p className="truncate">Resposta: {notification.data.response}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markNotificationsAsRead}
                  className="flex-1"
                >
                  Marcar como lidas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearNotifications}
                  className="flex-1"
                >
                  Limpar todas
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};