import { NextResponse } from "next/server";
import { assertAdminSecret } from "@/lib/team-report";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { secret?: string };
    assertAdminSecret(body.secret);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "認証に失敗しました" },
      { status: 401 },
    );
  }
}
