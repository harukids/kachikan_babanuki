import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { TeamSnapshot } from "@/lib/team-report";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: "IDがありません" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("team_reports")
      .select("id, room_code, group_label, snapshot, analysis, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "レポートが見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: data.id as string,
      roomCode: data.room_code as string,
      groupLabel: data.group_label as string,
      snapshot: data.snapshot as TeamSnapshot,
      analysis: (data.analysis as string | null) ?? "",
      createdAt: data.created_at as string,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "読み込みに失敗しました" },
      { status: 500 },
    );
  }
}
