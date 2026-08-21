import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  assertAdminSecret,
  buildTeamSnapshot,
  MAX_TEAM_GROUPS,
  pillarSummaryLines,
} from "@/lib/team-report";
import type { Player, Room } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  secret?: string;
  roomCode?: string;
  assignments?: Record<string, number>;
};

async function generateAnalysis(summary: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return "（AI未設定のため分析文はスキップされました。柱の集計は上のグラフを参照してください。）";
  }

  const system = [
    "あなたはチームの価値観ワークのファシリテーターです。",
    "与えられた集計だけを根拠に、短くチーム傾向を日本語で書いてください。",
    "断定しすぎず、「〜の傾向がある」「〜を軸にする人がいる」程度のトーン。",
    "3〜5文、200〜320字。見出しや箇条書きは使わない。",
    "個人のプライベートな理由には踏み込まない。",
  ].join("");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 400,
      messages: [
        { role: "system", content: system },
        { role: "user", content: summary },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenAI team analysis failed", await res.text());
    return "分析文の生成に失敗しました。集計結果は利用できます。";
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return (
    (data.choices?.[0]?.message?.content ?? "").trim() ||
    "分析文を取得できませんでした。"
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    assertAdminSecret(body.secret);
    const code = (body.roomCode ?? "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json(
        { error: "部屋コードを入力してください" },
        { status: 400 },
      );
    }

    const assignments = body.assignments ?? {};
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
      .eq("room_code", code);
    if (playersError) throw playersError;

    const byGroup = new Map<number, Player[]>();
    for (const p of (players ?? []) as Player[]) {
      const g = assignments[p.id] ?? 0;
      if (g < 1 || g > MAX_TEAM_GROUPS) continue;
      const list = byGroup.get(g) ?? [];
      list.push(p);
      byGroup.set(g, list);
    }

    if (byGroup.size === 0) {
      return NextResponse.json(
        { error: "少なくとも1人を班に振り分けてください" },
        { status: 400 },
      );
    }

    const created: Array<{
      id: string;
      groupIndex: number;
      groupLabel: string;
      memberCount: number;
      sharePath: string;
    }> = [];

    const sortedGroups = [...byGroup.entries()].sort((a, b) => a[0] - b[0]);
    for (const [groupIndex, members] of sortedGroups) {
      if (members.length === 0) continue;
      const groupLabel = `班${groupIndex}`;
      const snapshot = buildTeamSnapshot(code, groupLabel, members);
      const summary = pillarSummaryLines(snapshot).join("\n");
      const analysis = await generateAnalysis(summary);

      const { data: row, error: insertError } = await supabase
        .from("team_reports")
        .insert({
          room_code: code,
          group_index: groupIndex,
          group_label: groupLabel,
          member_ids: members.map((m) => m.id),
          snapshot,
          analysis,
        })
        .select("id, group_index, group_label")
        .single();
      if (insertError) throw insertError;

      created.push({
        id: row.id as string,
        groupIndex: row.group_index as number,
        groupLabel: row.group_label as string,
        memberCount: members.length,
        sharePath: `/report/${row.id}`,
      });
    }

    return NextResponse.json({ reports: created });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成に失敗しました";
    const status = message.includes("合言葉") ? 401 : 500;
    console.error(e);
    return NextResponse.json({ error: message }, { status });
  }
}
