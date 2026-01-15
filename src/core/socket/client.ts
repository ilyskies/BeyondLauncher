import { SocketEventMap, SocketEventType } from "@/shared/types/socket";
import { LauncherSocket, SocketConfig } from "./manager";

export class SocketClient {
  private socket: LauncherSocket;

  constructor(config: SocketConfig) {
    this.socket = new LauncherSocket(config);
  }

  async connect(): Promise<void> {
    return this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  send<T extends SocketEventType>(type: T, data: SocketEventMap[T]): void {
    this.socket.send(type, data);
  }

  on<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): () => void {
    return this.socket.on(event, handler);
  }

  off<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): void {
    this.socket.off(event, handler);
  }

  once<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): void {
    this.socket.once(event, handler);
  }

  get isConnected(): boolean {
    return this.socket.isConnected;
  }
}
