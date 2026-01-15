import { SocketEventMap, SocketEventType } from "@/shared/types/socket";

export class SocketEventManager {
  private listeners: Partial<
    Record<SocketEventType, Set<(data: unknown) => void>>
  > = {};
  private onceListeners: Partial<
    Record<SocketEventType, Set<(data: unknown) => void>>
  > = {};

  on<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): () => void {
    const set =
      (this.listeners[event] as
        | Set<(data: SocketEventMap[T]) => void>
        | undefined) ?? new Set<(data: SocketEventMap[T]) => void>();

    set.add(handler);
    this.listeners[event] = set as Set<(data: unknown) => void>;
    return () => this.off(event, handler);
  }

  once<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): void {
    const set =
      (this.onceListeners[event] as
        | Set<(data: SocketEventMap[T]) => void>
        | undefined) ?? new Set<(data: SocketEventMap[T]) => void>();

    set.add(handler);
    this.onceListeners[event] = set as Set<(data: unknown) => void>;
  }

  off<T extends SocketEventType>(
    event: T,
    handler: (data: SocketEventMap[T]) => void
  ): void {
    (
      this.listeners[event] as
        | Set<(data: SocketEventMap[T]) => void>
        | undefined
    )?.delete(handler);
    (
      this.onceListeners[event] as
        | Set<(data: SocketEventMap[T]) => void>
        | undefined
    )?.delete(handler);
  }

  emit<T extends SocketEventType>(event: T, data: SocketEventMap[T]): void {
    (
      this.listeners[event] as
        | Set<(data: SocketEventMap[T]) => void>
        | undefined
    )?.forEach((h) => h(data));

    const onceSet = this.onceListeners[event] as
      | Set<(data: SocketEventMap[T]) => void>
      | undefined;
    if (onceSet) {
      onceSet.forEach((h) => h(data));
      delete this.onceListeners[event];
    }
  }

  clear(): void {
    this.listeners = {};
    this.onceListeners = {};
  }
}
