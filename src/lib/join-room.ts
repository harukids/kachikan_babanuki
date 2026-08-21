import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_PLAYERS } from "@/lib/types";
import { savePlayerId } from "@/lib/player-storage";

export async function joinRoomAsGuest(
  supabase: SupabaseClient,
  code: string,
  displayName: string,
): Promise<string> {
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("code, phase")
    .eq("code", code)
    .maybeSingle();
  if (roomError) throw roomError;
  if (!room) throw new Error("部屋が見つかりません");
  if (room.phase !== "LOBBY") {
    throw new Error("この部屋はすでに開始済みです");
  }

  const { data: playersNow, error: listError } = await supabase
    .from("players")
    .select("id")
    .eq("room_code", code);
  if (listError) throw listError;
  if ((playersNow?.length ?? 0) >= MAX_PLAYERS) {
    throw new Error(`この部屋は満員です（上限${MAX_PLAYERS}人）`);
  }

  const playerId = crypto.randomUUID();
  const { error: playerError } = await supabase.from("players").insert({
    id: playerId,
    room_code: code,
    display_name: displayName.trim() || "ゲスト",
    seat_index: playersNow?.length ?? 0,
    is_host: false,
    hand: [],
  });
  if (playerError) throw playerError;

  const seatOrder = [...(playersNow?.map((p) => p.id) ?? []), playerId];
  const { error: seatError } = await supabase
    .from("rooms")
    .update({ seat_order: seatOrder })
    .eq("code", code);
  if (seatError) throw seatError;

  savePlayerId(code, playerId);
  return playerId;
}
