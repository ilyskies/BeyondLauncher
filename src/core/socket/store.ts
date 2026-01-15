import { create } from "zustand";
import { SocketClient } from "./client";
import { SocketConfig } from "./manager";
import { SocketEvent, SocketEventMap } from "@/shared/types/socket";

interface SocketStore {
  client: SocketClient | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  initialize: (config: SocketConfig) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  cleanup: () => void;
  send: <T extends SocketEvent>(type: T, data: SocketEventMap[T]) => void;
  on: <T extends SocketEvent>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ) => void;
  off: <T extends SocketEvent>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  client: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,

  initialize: (config) => {
    const { client, cleanup } = get();

    if (client) {
      cleanup();
    }

    const newClient = new SocketClient(config);

    newClient.on("connected", () => {
      set({ isConnected: true, isConnecting: false, connectionError: null });
    });

    newClient.on("disconnected", () => {
      set({ isConnected: false, isConnecting: false });
    });

    newClient.on(
      "error",
      (errorData: { message: string; critical: boolean }) => {
        set({ connectionError: errorData.message, isConnecting: false });
      }
    );

    set({ client: newClient });
  },

  connect: async () => {
    const { client } = get();
    if (!client) throw new Error("Socket client not initialized");

    try {
      set({ isConnecting: true, connectionError: null });
      await client.connect();
    } catch (error) {
      set({ connectionError: (error as Error).message, isConnecting: false });
      throw error;
    }
  },

  disconnect: () => {
    const { client } = get();
    client?.disconnect();
    set({ isConnecting: false });
  },

  cleanup: () => {
    const { client } = get();
    client?.disconnect();
    set({
      client: null,
      isConnected: false,
      isConnecting: false,
      connectionError: null,
    });
  },

  send: (type, data) => {
    const { client } = get();
    client?.send(type, data);
  },

  on: (event, callback) => {
    const { client } = get();
    client?.on(event, callback);
  },

  off: (event, callback) => {
    const { client } = get();
    client?.off(event, callback);
  },
}));
