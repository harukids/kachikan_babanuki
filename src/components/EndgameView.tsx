"use client";

import { useMemo, useState } from "react";
import { getCard, PILLAR_LABEL } from "@/lib/deck";
import {
  closeRoom,
  formatResultsText,
  submitReason,
  submitSelection,
} from "@/lib/game-actions";
import { createBrowserClient } from "@/lib/supabase/client";
import { downloadResultPoster } from "@/lib/result-poster";
import type { Player, Room } from "@/lib/types";

type Props = {
  room: Room;
  players: Player[];
  me: Player;
  onChanged: () => Promise<void>;
};

export function EndgameView({ room, players, me, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainId, setMainId] = useState<string | null>(me.main_card_id);
  const [subIds, setSubIds] = useState<string[]>(me.sub_card_ids ?? []);
  const [reason, setReason] = useState(me.reason ?? "");
  const [copied, setCopied] = useState(false);
  const [savingPosterId, setSavingPosterId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...players].sort((a, b) => {
        const ai = a.seat_index ?? 999;
        const bi = b.seat_index ?? 999;
        return ai - bi;
      }),
    [players],
  );

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  function toggleSub(id: string) {
    if (id === mainId) return;
    setSubIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  if (room.phase === "SELECTING") {
    const waiting = sorted.filter((p) => !p.ready_selecting);
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
          <h2 className="text-sm font-semibold text-accent">価値観を選ぶ</h2>
          <p className="text-sm text-muted">
            手札5枚から、メイン1・サブ2を選んでください。
          </p>
          {me.ready_selecting ? (
            <p className="text-sm text-mint">
              送信済みです。ほかの人の選定待ち（残り {waiting.length} 人）…
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {me.hand.map((id) => {
                  const card = getCard(id);
                  const isMain = mainId === id;
                  const isSub = subIds.includes(id);
                  return (
                    <div
                      key={id}
                      className={`min-w-[96px] rounded-xl border px-3 py-3 text-center ${
                        isMain
                          ? "border-accent bg-accent/10"
                          : isSub
                            ? "border-mint bg-mint/10"
                            : "border-line bg-background"
                      }`}
                    >
                      <div className="font-bold">{card?.label}</div>
                      <div className="mt-1 text-[10px] text-muted">
                        {card ? PILLAR_LABEL[card.pillar] : ""}
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={busy}
                          className="rounded-lg border border-line px-2 py-1 text-[11px]"
                          onClick={() => {
                            setMainId(id);
                            setSubIds((prev) => prev.filter((x) => x !== id));
                          }}
                        >
                          メイン
                        </button>
                        <button
                          type="button"
                          disabled={busy || mainId === id}
                          className="rounded-lg border border-line px-2 py-1 text-[11px] disabled:opacity-30"
                          onClick={() => toggleSub(id)}
                        >
                          サブ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted">
                メイン: {mainId ? getCard(mainId)?.label : "未選択"} ／ サブ:{" "}
                {subIds.map((id) => getCard(id)?.label).join("、") || "未選択"}
              </p>
              <button
                type="button"
                disabled={busy || !mainId || subIds.length !== 2}
                className="rounded-xl bg-accent px-4 py-3 text-sm font-bold text-[#1c2421] disabled:opacity-40"
                onClick={() =>
                  void run(async () => {
                    if (!mainId || subIds.length !== 2) return;
                    const supabase = createBrowserClient();
                    await submitSelection({
                      supabase,
                      room,
                      players,
                      actorId: me.id,
                      mainCardId: mainId,
                      subCardIds: [subIds[0], subIds[1]],
                    });
                  })
                }
              >
                この3枚で確定する
              </button>
            </>
          )}
        </section>
        {error && <p className="text-sm text-[#f0a0a0]">{error}</p>}
      </div>
    );
  }

  if (room.phase === "WRITING") {
    const waiting = sorted.filter((p) => !p.ready_writing);
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
          <h2 className="text-sm font-semibold text-accent">理由を書く</h2>
          <p className="text-sm text-muted">
            メイン {getCard(me.main_card_id ?? "")?.label} ／ サブ{" "}
            {(me.sub_card_ids ?? []).map((id) => getCard(id)?.label).join("、")}
          </p>
          {me.ready_writing ? (
            <p className="text-sm text-mint">
              送信済みです。ほかの人の入力待ち（残り {waiting.length} 人）…
            </p>
          ) : (
            <>
              <textarea
                className="min-h-28 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                maxLength={200}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="なぜこの価値観を選んだか（200文字まで）"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">{reason.length} / 200</span>
                <button
                  type="button"
                  disabled={busy || !reason.trim()}
                  className="rounded-xl bg-accent px-4 py-3 text-sm font-bold text-[#1c2421] disabled:opacity-40"
                  onClick={() =>
                    void run(async () => {
                      const supabase = createBrowserClient();
                      await submitReason({
                        supabase,
                        room,
                        players,
                        actorId: me.id,
                        reason,
                      });
                    })
                  }
                >
                  理由を送る
                </button>
              </div>
            </>
          )}
        </section>
        {error && <p className="text-sm text-[#f0a0a0]">{error}</p>}
      </div>
    );
  }

  if (room.phase === "RESULT" || room.phase === "CLOSED") {
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-panel p-4 space-y-4 shadow-[0_10px_30px_rgba(22,56,47,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-mint">結果</h2>
              <p className="mt-1 text-xs text-muted">
                自分の分は、壁に貼れるポスター画像としても保存できます。
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl border border-line px-3 py-2 text-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(formatResultsText(sorted));
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                } catch {
                  setError("コピーに失敗しました");
                }
              }}
            >
              {copied ? "コピーしました" : "全員分をテキストコピー"}
            </button>
          </div>

          {/* 自分のポスタープレビュー風 */}
          <div className="overflow-hidden rounded-2xl border border-mint/30 bg-gradient-to-br from-[#e8fbf4] via-white to-[#e6f3ff] p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-mint">
              わたしの価値観
            </p>
            <p className="mt-1 text-sm text-muted">{me.display_name}</p>
            <p className="mt-4 text-4xl font-bold text-foreground">
              {getCard(me.main_card_id ?? "")?.label ?? "—"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(me.sub_card_ids ?? []).map((id) => (
                <span
                  key={id}
                  className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-mint shadow-sm"
                >
                  {getCard(id)?.label}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80">
              {me.reason || "（理由なし）"}
            </p>
            <button
              type="button"
              disabled={savingPosterId === me.id}
              className="mt-5 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-[#16382f] disabled:opacity-50"
              onClick={() =>
                void (async () => {
                  setSavingPosterId(me.id);
                  setError(null);
                  try {
                    await downloadResultPoster({
                      displayName: me.display_name,
                      mainCardId: me.main_card_id,
                      subCardIds: me.sub_card_ids ?? [],
                      reason: me.reason,
                    });
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "画像保存に失敗しました",
                    );
                  } finally {
                    setSavingPosterId(null);
                  }
                })()
              }
            >
              {savingPosterId === me.id
                ? "作成中…"
                : "自分のポスターを画像で保存"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((p) => (
              <article
                key={p.id}
                className="rounded-xl border border-line bg-background p-3 space-y-2"
              >
                <h3 className="font-semibold">
                  {p.display_name}
                  {p.id === me.id ? "（あなた）" : ""}
                </h3>
                <div className="flex flex-wrap gap-1">
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                    メイン: {getCard(p.main_card_id ?? "")?.label ?? "—"}
                  </span>
                  {(p.sub_card_ids ?? []).map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-mint/15 px-2 py-0.5 text-xs font-semibold text-mint"
                    >
                      サブ: {getCard(id)?.label ?? id}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {p.reason || "（理由なし）"}
                </p>
                {p.id === me.id ? null : (
                  <button
                    type="button"
                    disabled={savingPosterId === p.id}
                    className="text-xs font-semibold text-mint underline disabled:opacity-50"
                    onClick={() =>
                      void (async () => {
                        setSavingPosterId(p.id);
                        setError(null);
                        try {
                          await downloadResultPoster({
                            displayName: p.display_name,
                            mainCardId: p.main_card_id,
                            subCardIds: p.sub_card_ids ?? [],
                            reason: p.reason,
                          });
                        } catch (e) {
                          setError(
                            e instanceof Error
                              ? e.message
                              : "画像保存に失敗しました",
                          );
                        } finally {
                          setSavingPosterId(null);
                        }
                      })()
                    }
                  >
                    {savingPosterId === p.id ? "作成中…" : "この人の分を画像保存"}
                  </button>
                )}
              </article>
            ))}
          </div>
          {me.is_host && room.phase === "RESULT" && (
            <button
              type="button"
              disabled={busy}
              className="rounded-xl border border-line px-3 py-2 text-sm text-muted"
              onClick={() =>
                void run(async () => {
                  const supabase = createBrowserClient();
                  await closeRoom({ supabase, room, actorId: me.id });
                })
              }
            >
              部屋を閉じる
            </button>
          )}
          {room.phase === "CLOSED" && (
            <p className="text-sm text-muted">この部屋は閉じられました。</p>
          )}
        </section>
        {error && <p className="text-sm text-[#d64545]">{error}</p>}
      </div>
    );
  }

  return null;
}
