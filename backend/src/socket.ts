import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyAccessToken } from './utils/jwt';
import { config } from './config';

let io: Server | undefined;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, { cors: { origin: config.cors.origin, credentials: true } });
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return next(new Error('Authentication required'));
      socket.data.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid access token'));
    }
  });
  io.on('connection', (socket) => {
    const user = socket.data.user as { userId: number; role: string };
    socket.join(`user:${user.userId}`);
    socket.join(`role:${user.role}`);
    socket.on('order:subscribe', (orderId: number) => Number.isInteger(orderId) && socket.join(`order:${orderId}`));
  });
  return io;
}

export function emitOrderEvent(event: string, order: { id: number; userId: number; deliveryPartner?: { userId?: number } | null }) {
  if (!io) return;
  io.to(`order:${order.id}`).emit(event, order);
  io.to(`user:${order.userId}`).emit(event, order);
  io.to('role:ADMIN').emit(event, order);
  io.to('role:DELIVERY_PARTNER').emit(event, order);
  if (order.deliveryPartner?.userId) io.to(`user:${order.deliveryPartner.userId}`).emit(event, order);
}

export function emitStockUpdate(product: { id: number; stock: number }) {
  io?.emit('stockUpdated', product);
}
