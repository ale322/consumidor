import { Server } from 'socket.io';
import { db } from '@/lib/db';

export interface ComplaintNotification {
  type: 'NEW_COMPLAINT' | 'STATUS_UPDATE' | 'RESPONSE_RECEIVED' | 'RESOLVED';
  complaintId: string;
  userId: string;
  message: string;
  data?: any;
  timestamp: string;
}

export const setupSocket = (io: Server) => {
  // Store user socket connections
  const userSockets = new Map<string, string>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle user authentication and socket registration
    socket.on('register_user', (userId: string) => {
      userSockets.set(userId, socket.id);
      socket.join(`user_${userId}`);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Handle complaint status updates
    socket.on('complaint_status_update', async (data: {
      complaintId: string;
      status: string;
      message?: string;
      updatedBy: string;
    }) => {
      try {
        // Update complaint in database
        const updatedComplaint = await db.complaint.update({
          where: { id: data.complaintId },
          data: {
            status: data.status,
            updatedAt: new Date(),
            // Add status history
            statusHistory: {
              push: {
                status: data.status,
                message: data.message || '',
                timestamp: new Date().toISOString(),
                updatedBy: data.updatedBy
              }
            }
          }
        });

        // Create notification
        const notification: ComplaintNotification = {
          type: 'STATUS_UPDATE',
          complaintId: data.complaintId,
          userId: updatedComplaint.userId,
          message: data.message || `Status da reclamação atualizado para: ${data.status}`,
          data: {
            status: data.status,
            previousStatus: updatedComplaint.status,
            updatedAt: updatedComplaint.updatedAt
          },
          timestamp: new Date().toISOString()
        };

        // Send notification to user
        io.to(`user_${updatedComplaint.userId}`).emit('complaint_notification', notification);

        // If complaint is resolved, send special notification
        if (data.status === 'RESOLVED') {
          const resolvedNotification: ComplaintNotification = {
            type: 'RESOLVED',
            complaintId: data.complaintId,
            userId: updatedComplaint.userId,
            message: 'Sua reclamação foi resolvida com sucesso!',
            data: {
              resolutionDetails: data.message,
              resolvedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };
          io.to(`user_${updatedComplaint.userId}`).emit('complaint_notification', resolvedNotification);
        }

      } catch (error) {
        console.error('Error updating complaint status:', error);
        socket.emit('error', { message: 'Failed to update complaint status' });
      }
    });

    // Handle new complaint notifications
    socket.on('new_complaint', async (data: {
      userId: string;
      complaintData: any;
    }) => {
      try {
        const notification: ComplaintNotification = {
          type: 'NEW_COMPLAINT',
          complaintId: data.complaintData.id,
          userId: data.userId,
          message: 'Nova reclamação registrada com sucesso!',
          data: {
            complaint: data.complaintData,
            createdAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        };

        // Send notification to user
        io.to(`user_${data.userId}`).emit('complaint_notification', notification);

        // Notify admin users (if any)
        io.to('admin_users').emit('new_complaint_admin', {
          complaintId: data.complaintData.id,
          userId: data.userId,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error creating new complaint notification:', error);
      }
    });

    // Handle company responses
    socket.on('company_response', async (data: {
      complaintId: string;
      response: string;
      companyId: string;
    }) => {
      try {
        // Get complaint details
        const complaint = await db.complaint.findUnique({
          where: { id: data.complaintId },
          include: { user: true }
        });

        if (complaint) {
          const notification: ComplaintNotification = {
            type: 'RESPONSE_RECEIVED',
            complaintId: data.complaintId,
            userId: complaint.userId,
            message: 'Nova resposta recebida da empresa',
            data: {
              response: data.response,
              companyId: data.companyId,
              respondedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };

          // Send notification to user
          io.to(`user_${complaint.userId}`).emit('complaint_notification', notification);
        }

      } catch (error) {
        console.error('Error handling company response:', error);
      }
    });

    // Handle real-time complaint tracking
    socket.on('track_complaint', (complaintId: string) => {
      socket.join(`complaint_${complaintId}`);
      console.log(`User ${socket.id} tracking complaint ${complaintId}`);
    });

    socket.on('untrack_complaint', (complaintId: string) => {
      socket.leave(`complaint_${complaintId}`);
      console.log(`User ${socket.id} stopped tracking complaint ${complaintId}`);
    });

    // Handle messages (legacy support)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove from user sockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Bem-vindo ao sistema de notificações da Central do Consumidor!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};