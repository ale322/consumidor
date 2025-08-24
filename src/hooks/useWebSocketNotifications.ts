'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ComplaintNotification } from '@/lib/socket';

interface UseWebSocketNotificationsProps {
  userId?: string;
  onNotification?: (notification: ComplaintNotification) => void;
  onComplaintUpdate?: (complaintId: string, data: any) => void;
}

export const useWebSocketNotifications = ({
  userId,
  onNotification,
  onComplaintUpdate
}: UseWebSocketNotificationsProps = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<ComplaintNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socketio',
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
      
      // Register user if userId is provided
      if (userId) {
        socketInstance.emit('register_user', userId);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    // Handle complaint notifications
    socketInstance.on('complaint_notification', (notification: ComplaintNotification) => {
      console.log('Received complaint notification:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Call custom handler if provided
      if (onNotification) {
        onNotification(notification);
      }
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('Central do Consumidor', {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    // Handle complaint updates
    socketInstance.on('complaint_update', (data: { complaintId: string; update: any }) => {
      console.log('Received complaint update:', data);
      
      if (onComplaintUpdate) {
        onComplaintUpdate(data.complaintId, data.update);
      }
    });

    // Handle error messages
    socketInstance.on('error', (error: { message: string }) => {
      console.error('WebSocket error:', error);
    });

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, onNotification, onComplaintUpdate]);

  // Function to track a specific complaint
  const trackComplaint = (complaintId: string) => {
    if (socket && isConnected) {
      socket.emit('track_complaint', complaintId);
    }
  };

  // Function to stop tracking a complaint
  const untrackComplaint = (complaintId: string) => {
    if (socket && isConnected) {
      socket.emit('untrack_complaint', complaintId);
    }
  };

  // Function to mark notifications as read
  const markNotificationsAsRead = () => {
    setUnreadCount(0);
  };

  // Function to clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Function to send complaint status update (for admin/company use)
  const updateComplaintStatus = (data: {
    complaintId: string;
    status: string;
    message?: string;
    updatedBy: string;
  }) => {
    if (socket && isConnected) {
      socket.emit('complaint_status_update', data);
    }
  };

  // Function to send company response
  const sendCompanyResponse = (data: {
    complaintId: string;
    response: string;
    companyId: string;
  }) => {
    if (socket && isConnected) {
      socket.emit('company_response', data);
    }
  };

  return {
    socket,
    isConnected,
    notifications,
    unreadCount,
    trackComplaint,
    untrackComplaint,
    markNotificationsAsRead,
    clearNotifications,
    updateComplaintStatus,
    sendCompanyResponse
  };
};