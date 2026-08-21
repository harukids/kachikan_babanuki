import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { assertAdminSecret } from "@/lib/team-report";
import type { Player, Room } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { secret?: string; roomCode?: string };
    assertAdminSecret(body.secret);
    const code = (body.roomCode ?? "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json(
        { error: "部屋コードを入力してください" },
        { status: 400 },
      );
    }

    const supabase = createServerSupabase();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (roomError) throw roomError;
    if (!room) {
      return NextResponse.json({ error: "部屋が見つかりません" }, { status: 404 });
    }

    const phase = (room as Room).phase;
    if (phase !== "RESULT" && phase !== "CLOSED") {
      return NextResponse.json(
        { error: "結果フェーズ以降の部屋だけレポートできます" },
        { status: 400 },
      );
    }

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("room_code", code)
      .order("seat_index", { ascending: true });
    if (playersError) throw playersError;

    return NextResponse.json({
      room: room as Room,
      players: (players ?? []) as Player[],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "読み込みに失敗しました";
    const status = message.includes("合言葉") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
