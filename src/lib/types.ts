/** 状態マシン仕様に対応する型 */

export type Pillar = "heart" | "work" | "growth";

export type RoomPhase =
  | "LOBBY"
  | "DEALING"
  | "PLAYING"
  | "SELECTING"
  | "WRITING"
  | "RESULT"
  | "CLOSED";

export type PlaySubState =
  | "STEAL_SELECT"
  | "STEAL_CONFIRM"
  | "DISCARD"
  | "GAIN";

export type CardDef = {
  id: string;
  label: string;
  pillar: Pillar;
};

export type Player = {
  id: string;
  room_code: string;
  display_name: string;
  seat_index: number | null;
  hand: string[];
  turns_completed: number;
  main_card_id: string | null;
  sub_card_ids: string[];
  reason: string | null;
  statement?: string | null;
  ready_selecting: boolean;
  ready_writing: boolean;
  is_host: boolean;
  created_at?: string;
};

export type Room = {
  code: string;
  phase: RoomPhase;
  seat_order: string[];
  current_player_id: string | null;
  sub_state: PlaySubState | null;
  pending_card_id: string | null;
  deny_count: number;
  denied_card_ids: string[];
  host_id: string;
  field: string[];
  created_at?: string;
  closed_at?: string | null;
};

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;
export const RECOMMENDED_MAX = 5;
export const TURNS_PER_PLAYER = 5;
export const MAX_DENY = 4;
export const HAND_SIZE = 5;
