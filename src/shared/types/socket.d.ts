import { BeyondUser } from "./beyond";

export interface SocketEventMap {
  connected: void;
  disconnected: { code: number; reason: string };
  error: { message: string; critical: boolean };

  user: BeyondUser;
  new_username: NewUsernameData;
  request_user: void;
  authenticated: void;

  setup_complete: void;
  set_new_username: { username: string };
  request_heartbeat: void;

  patch_notes_update: { patchNotes: PatchNote[] };
  player_count_update: { playersOnline: number; friendsOnline: number };
  mark_patch_note_read: { noteId: string };
  request_patch_notes: void;
  request_player_count: void;

  check_username: { username: string };
  username_available: { username: string; available: boolean };
  username_taken: { username: string };

  news_update: { news: NewsItem[] };
  request_news: void;

  request_exchange_code: void;
  exchange_code: string;

  request_friends: void;
  friends_list: { friends: Friend[] };

  request_profile_update: void;
  profile_update: { user: BeyondUser };
}

export type SocketEvent = keyof SocketEventMap;
export type SocketEventType = keyof SocketEventMap;

export interface SocketMessage<T extends SocketEventType = SocketEventType> {
  type: T;
  data: SocketEventMap[T];
  timestamp: number;
  version: string;
}

export interface NewUsernameData {
  username: string;
}

export interface PatchNote {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  author?: string;
  views?: number;
  content: string;
  image?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
}

export interface Friend {
  id: string;
  displayName: string;
  avatar: string;
  discordId: string;
  status: "online" | "away" | "offline";
  presence: string;
}
