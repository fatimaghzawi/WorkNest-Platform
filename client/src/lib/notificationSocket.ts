import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '../utils/authToken';

const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;

let socket: Socket | null = null;

export function getNotificationSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectNotificationSocket() {
  const instance = getNotificationSocket();
  const token = getAccessToken();
  instance.auth = token ? { token } : {};
  if (!instance.connected) {
    instance.connect();
  }
  return instance;
}

export function disconnectNotificationSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
