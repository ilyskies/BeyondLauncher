import {
  SocketEventMap,
  SocketEventType,
  SocketMessage,
} from "@/shared/types/socket";
import { SocketConnection } from "./connection";
import { SocketEventManager } from "./event-manager";

export interface SocketConfig {
  url: string;
  version: string;
  token: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export class LauncherSocket {
  private connection: SocketConnection | null = null;
  private events = new SocketEventManager();
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private isIntentionalDisconnect = false;

  constructor(private config: SocketConfig) {
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
    this.reconnectDelay = config.reconnectDelay ?? 2000;
  }

  async connect(): Promise<void> {
    if (this.connection?.readyState === WebSocket.OPEN) return;

    this.isIntentionalDisconnect = false;

    try {
      this.connection = new SocketConnection(
        this.config.url,
        this.config.version,
        this.config.token
      );
      this.setupEventHandlers();

      await new Promise((resolve, reject) => {
        if (!this.connection) return reject(new Error("Connection failed"));

        const onOpen = () => {
          cleanup();
          resolve(void 0);
        };

        const onError = () => {
          cleanup();
          reject(new Error("WebSocket connection failed"));
        };

        const cleanup = () => {
          this.connection?.removeEventListener("open", onOpen);
          this.connection?.removeEventListener("error", onError);
        };

        this.connection.addEventListener("open", onOpen);
        this.connection.addEventListener("error", onError);
      });

      this.reconnectAttempts = 0;
      this.events.emit("connected", void 0);
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }
  }

  disconnect(): void {
    this.isIntentionalDisconnect = true;
    this.reconnectAttempts = 0;
    this.connection?.close();
    this.connection = null;
    this.events.emit("disconnected", {
      code: 1000,
      reason: "Intentional disconnect",
    });
  }

  private handleConnectionError(error: unknown): void {
    this.events.emit("error", {
      message: error instanceof Error ? error.message : String(error),
      critical: true,
    });

    if (!this.isIntentionalDisconnect) {
      this.attemptReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data) as SocketMessage;
        this.events.emit(message.type as SocketEventType, message.data);
      } catch {
        this.events.emit("error", {
          message: "Failed to parse message",
          critical: false,
        });
      }
    });

    this.connection.addEventListener("close", (event) => {
      this.events.emit("disconnected", {
        code: event.code,
        reason: event.reason,
      });

      const isAuthError = event.code === 1008;
      if (!this.isIntentionalDisconnect && !isAuthError) {
        this.attemptReconnect();
      } else if (isAuthError) {
        this.events.emit("error", {
          message: event.reason || "Authentication failed",
          critical: true,
        });
      }
    });

    this.connection.addEventListener("error", () => {
      this.events.emit("error", {
        message: "WebSocket error occurred",
        critical: true,
      });
    });
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.events.emit("error", {
        message: "Max reconnection attempts reached",
        critical: true,
      });
      return;
    }

    this.reconnectAttempts++;

    await new Promise((resolve) =>
      setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts)
    );

    try {
      await this.connect();
    } catch {}
  }

  send<T extends SocketEventType>(
    type: T,
    data: Omit<SocketEventMap[T], "timestamp" | "version">
  ): boolean {
    return this.connection?.safeSend({ type, data }) ?? false;
  }

  on<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): () => void {
    return this.events.on(event, handler);
  }

  once<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): void {
    this.events.once(event, handler);
  }

  off<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): void {
    this.events.off(event, handler);
  }

  get isConnected(): boolean {
    return this.connection?.readyState === WebSocket.OPEN;
  }

  get readyState(): number {
    return this.connection?.readyState ?? WebSocket.CLOSED;
  }
}
