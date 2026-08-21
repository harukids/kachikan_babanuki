import { NextResponse } from "next/server";
import { getCard } from "@/lib/deck";

export const runtime = "nodejs";

type Body = {
  mainCardId?: string | null;
  subCardIds?: string[];
  handCardIds?: string[];
  reason?: string | null;
};

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が設定されていません" },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const reason = (body.reason ?? "").trim();
  if (!reason) {
    return NextResponse.json(
      { error: "理由（あなたの言葉）が必要です" },
      { status: 400 },
    );
  }

  const main = body.mainCardId ? getCard(body.mainCardId) : null;
  const subs = (body.subCardIds ?? [])
    .map((id) => getCard(id)?.label)
    .filter((x): x is string => Boolean(x));
  const hand = (body.handCardIds ?? [])
    .map((id) => getCard(id)?.label)
    .filter((x): x is string => Boolean(x));

  const system = [
    "あなたは価値観ワークのファシリテーターです。",
    "ユーザーが選んだ価値観カードと、短い理由をもとに、",
    "壁に貼れる『価値観ステートメント（宣言文）』を日本語で書いてください。",
    "文体は短めの宣言調（だ・である）。です・ます調は使わない。",
    "2〜4文、全体で120〜220字程度。引用符や見出しは付けない。",
    "カード名を無理に全部並べず、意味を汲み取って自然な宣言にする。",
    "本人の理由のニュアンスは残しつつ、ポスター向きに整える。",
  ].join("");

  const user = [
    `メイン: ${main?.label ?? "（なし）"}`,
    `サブ: ${subs.join("、") || "（なし）"}`,
    `最終5枚: ${hand.join("、") || "（なし）"}`,
    `本人の言葉: ${reason}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 280,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("OpenAI error", res.status, detail.slice(0, 500));
      return NextResponse.json(
        { error: "ステートメントの生成に失敗しました。しばらくして再試行してください。" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const statement = (data.choices?.[0]?.message?.content ?? "")
      .trim()
      .replace(/^["「]|["」]$/g, "");

    if (!statement) {
      return NextResponse.json(
        { error: "生成結果が空でした。もう一度お試しください。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ statement });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "通信エラーで生成できませんでした" },
      { status: 502 },
    );
  }
}
