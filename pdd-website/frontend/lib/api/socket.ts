import { io, Socket } from 'socket.io-client';

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;

  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // Production Cloud Hub: neurosignal-clinical-hub.onrender.com
    return isLocal ? 'http://localhost:5000' : 'https://neurosignal-clinical-hub.onrender.com';
  }
  return process.env.NODE_ENV === 'production' ? 'https://neurosignal-clinical-hub.onrender.com' : 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
      });

      this.socket.on('connect', () => {
        console.log('Clinical WebSocket Connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Clinical WebSocket Disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket Error:', error);
      });
    }
  }

  joinChannel(channel: string) {
    if (!this.socket) this.connect();
    this.socket?.emit('join_channel', channel);
  }

  sendMessage(channel: string, sender: string, text: string) {
    if (!this.socket) this.connect();
    this.socket?.emit('send_message', { channel, sender, text });
  }

  broadcastSignal(channel: string, payload: any) {
      if (!this.socket) this.connect();
      this.socket?.emit('broadcast_signal', { channel, ...payload });
  }

  onSignalSync(callback: (data: any) => void) {
      if (!this.socket) this.connect();
      this.socket?.on('receive_signal', callback);
  }

  triggerRedAlert(channel: string, sender: string, text: string) {
    if (!this.socket) this.connect();
    this.socket?.emit('trigger_red_alert', { channel, sender, text });
  }

  onMessage(callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('receive_message', callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
