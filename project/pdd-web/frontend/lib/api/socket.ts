import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

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
