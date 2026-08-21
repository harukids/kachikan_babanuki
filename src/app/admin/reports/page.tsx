"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getCard, PILLAR_LABEL } from "@/lib/deck";
import { MAX_TEAM_GROUPS } from "@/lib/team-report";
import type { Player, Room } from "@/lib/types";

type CreatedReport = {
  id: string;
  groupIndex: number;
  groupLabel: string;
  memberCount: number;
  sharePath: string;
};

const SECRET_KEY = "vd-admin-secret";

export default function AdminReportsPage() {
  const [secret, setSecret] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(SECRET_KEY) ?? "";
  });
  const [authed, setAuthed] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [reports, setReports] = useState<CreatedReport[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sortedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) => (a.seat_index ?? 999) - (b.seat_index ?? 999),
      ),
    [players],
  );

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "認証に失敗しました");
      sessionStorage.setItem(SECRET_KEY, secret);
      setAuthed(true);
    } catch (e) {
      setAuthed(false);
      setError(e instanceof Error ? e.message : "認証に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function loadRoom() {
    setBusy(true);
    setError(null);
    setReports([]);
    try {
      const res = await fetch("/api/admin/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, roomCode }),
      });
      const data = (await res.json()) as {
        room?: Room;
        players?: Player[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "読み込みに失敗しました");
      setRoom(data.room ?? null);
      const list = data.players ?? [];
      setPlayers(list);
      const next: Record<string, number> = {};
      for (const p of list) next[p.id] = 1;
      setAssignments(next);
    } catch (e) {
      setRoom(null);
      setPlayers([]);
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, roomCode, assignments }),
      });
      const data = (await res.json()) as {
        reports?: CreatedReport[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "生成に失敗しました");
      setReports(data.reports ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function copyShare(path: string, id: string) {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("コピーに失敗しました");
    }
  }

  if (!authed) {
    return (
      <main className="relative z-[1] mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12">
        <h1 className="text-2xl font-bold">チームレポート管理</h1>
        <p className="text-sm text-muted">
          合言葉は、この管理画面に入るためのあなた専用のパスワードです。参加者には教えません。
        </p>
        <label className="block space-y-1">
          <span className="text-sm text-muted">合言葉</span>
          <input
            type="text"
            autoComplete="off"
            className="w-full rounded-xl border border-line bg-panel px-3 py-2"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void verify();
            }}
            placeholder="合言葉を入力"
          />
        </label>
        <button
          type="button"
          disabled={busy || !secret.trim()}
          className="rounded-xl bg-gradient-to-r from-[#6ea8ff] via-[#ff8ec8] to-[#ffb086] px-4 py-3 text-sm font-bold text-[#12122a] disabled:opacity-40"
          onClick={() => void verify()}
        >
          入る
        </button>
        {error && <p className="text-sm text-[#f0a0a0]">{error}</p>}
        <Link href="/" className="text-sm text-mint underline">
          トップへ
        </Link>
      </main>
    );
  }

  return (
    <main className="relative z-[1] mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-wide text-mint">Admin</p>
        <h1 className="text-2xl font-bold">チームレポート</h1>
        <p className="text-sm text-muted">
          結果フェーズ以降の部屋を読み込み、最大{MAX_TEAM_GROUPS}
          班に振り分けてレポートを生成します。
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-line bg-panel p-4">
        <label className="block space-y-1">
          <span className="text-sm text-muted">部屋コード</span>
          <div className="flex flex-wrap gap-2">
            <input
              className="min-w-[8rem] flex-1 rounded-xl border border-line bg-background px-3 py-2 tracking-[0.15em]"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="AB3K9"
              maxLength={8}
            />
            <button
              type="button"
              disabled={busy || !roomCode.trim()}
              className="rounded-xl border border-line px-4 py-2 text-sm disabled:opacity-40"
              onClick={() => void loadRoom()}
            >
              読み込む
            </button>
          </div>
        </label>
        {room && (
          <p className="text-xs text-muted">
            部屋 {room.code} · フェーズ {room.phase} · {players.length}人
          </p>
        )}
      </section>

      {sortedPlayers.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold text-accent">班の振り分け</h2>
          <ul className="space-y-2">
            {sortedPlayers.map((p) => {
              const main = p.main_card_id ? getCard(p.main_card_id) : null;
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background px-3 py-2"
                >
                  <div>
                    <p className="font-semibold">{p.display_name}</p>
                    <p className="text-xs text-muted">
                      メイン: {main?.label ?? "—"}
                      {main ? `（${PILLAR_LABEL[main.pillar]}）` : ""}
                    </p>
                  </div>
                  <select
                    className="rounded-lg border border-line bg-panel px-2 py-1 text-sm"
                    value={assignments[p.id] ?? 0}
                    onChange={(e) =>
                      setAssignments((prev) => ({
                        ...prev,
                        [p.id]: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={0}>含めない</option>
                    {Array.from({ length: MAX_TEAM_GROUPS }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          班{n}
                        </option>
                      ),
                    )}
                  </select>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-[#6ea8ff] via-[#ff8ec8] to-[#ffb086] px-4 py-3 text-sm font-bold text-[#12122a] disabled:opacity-40"
            onClick={() => void generate()}
          >
            {busy ? "生成中…" : "レポートを生成する"}
          </button>
        </section>
      )}

      {reports.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold text-mint">できた共有リンク</h2>
          <ul className="space-y-3">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded-xl bg-background px-3 py-3 space-y-2"
              >
                <p className="font-semibold">
                  {r.groupLabel}（{r.memberCount}人）
                </p>
                <p className="break-all text-xs text-muted">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}${r.sharePath}`
                    : r.sharePath}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-line px-3 py-1.5 text-xs"
                    onClick={() => void copyShare(r.sharePath, r.id)}
                  >
                    {copiedId === r.id ? "コピーしました" : "URLをコピー"}
                  </button>
                  <Link
                    href={r.sharePath}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs text-mint"
                    target="_blank"
                  >
                    開く
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p className="text-sm text-[#f0a0a0]">{error}</p>}

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
