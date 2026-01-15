export class SocketConnection extends WebSocket {
  private readonly heartbeatInterval: number = 30000;
  private heartbeatTimer?: NodeJS.Timeout;
  public readonly version: string;
  public readonly token: string;

  constructor(url: string, version: string, token: string) {
    super(url);
    this.version = version;
    this.token = token;

    this.setupHeartbeat();
  }

  private setupHeartbeat(): void {
    this.addEventListener("open", () => {
      this.heartbeatTimer = setInterval(() => {
        if (this.readyState === WebSocket.OPEN) {
          this.send(
            JSON.stringify({
              type: "heartbeat",
              timestamp: Date.now(),
              version: this.version,
            })
          );
        }
      }, this.heartbeatInterval);
    });

    this.addEventListener("close", () => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }
    });
  }

  public safeSend(message: object): boolean {
    if (this.readyState !== WebSocket.OPEN) return false;

    try {
      this.send(
        JSON.stringify({
          ...message,
          timestamp: Date.now(),
          version: this.version,
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}
