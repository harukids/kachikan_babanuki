"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { clearPlayerId, loadPlayerId } from "@/lib/player-storage";
import { joinRoomAsGuest } from "@/lib/join-room";
import { startAndDeal } from "@/lib/game-actions";
import { PlayingView } from "@/components/PlayingView";
import { EndgameView } from "@/components/EndgameView";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  RECOMMENDED_MAX,
  type Player,
  type Room,
} from "@/lib/types";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toUpperCase();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [joinName, setJoinName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function copyText(kind: "link" | "code", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("コピーに失敗しました。手動で選択してコピーしてください。");
    }
  }

  const me = useMemo(
    () => players.find((p) => p.id === playerId) ?? null,
    [players, playerId],
  );

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserClient();
    const [{ data: roomData, error: roomError }, { data: playerData, error: playerError }] =
      await Promise.all([
        supabase.from("rooms").select("*").eq("code", code).maybeSingle(),
        supabase
          .from("players")
          .select("*")
          .eq("room_code", code)
          .order("created_at", { ascending: true }),
      ]);
    if (roomError) throw roomError;
    if (playerError) throw playerError;
    setRoom(roomData as Room | null);
    setPlayers((playerData as Player[]) ?? []);
    setLoaded(true);
  }, [code]);

  useEffect(() => {
    setPlayerId(loadPlayerId(code));
  }, [code]);

  // 保存された playerId が部屋にいない（別端末の残骸など）ならクリア
  useEffect(() => {
    if (!loaded || !playerId) return;
    if (players.some((p) => p.id === playerId)) return;
    clearPlayerId(code);
    setPlayerId(null);
  }, [loaded, players, playerId, code]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError("Supabase が未設定です");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "読み込みに失敗しました");
          setLoaded(true);
        }
      }
    })();

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`room-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `code=eq.${code}` },
        () => {
          void refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_code=eq.${code}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [code, refresh]);

  async function joinFromInvite() {
    if (!room || room.phase !== "LOBBY") return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const id = await joinRoomAsGuest(supabase, code, joinName);
      setPlayerId(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "入室できませんでした");
    } finally {
      setBusy(false);
    }
  }

  async function moveSeat(fromIndex: number, direction: -1 | 1) {
    if (!me?.is_host || !room || room.phase !== "LOBBY") return;
    const ordered = [...players].sort((a, b) => {
      const ai = a.seat_index ?? 999;
      const bi = b.seat_index ?? 999;
      if (ai !== bi) return ai - bi;
      return a.created_at!.localeCompare(b.created_at!);
    });
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= ordered.length) return;
    const next = [...ordered];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const seatOrder = next.map((p) => p.id);
      await Promise.all(
        next.map((p, i) =>
          supabase.from("players").update({ seat_index: i }).eq("id", p.id),
        ),
      );
      await supabase.from("rooms").update({ seat_order: seatOrder }).eq("code", code);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "並べ替えに失敗しました");
    } finally {
      setBusy(false);
    }
  }

  async function startGame() {
    if (!me?.is_host || !room) return;
    if (players.length < MIN_PLAYERS) {
      setError(`${MIN_PLAYERS}人以上必要です`);
      return;
    }
    if (players.length > MAX_PLAYERS) {
      setError(`${MAX_PLAYERS}人以下にしてください`);
      return;
    }
    if (players.length > RECOMMENDED_MAX) {
      const ok = window.confirm(
        `${players.length}人です。おすすめは${MIN_PLAYERS}〜${RECOMMENDED_MAX}人です。長くなりますが開始しますか？`,
      );
      if (!ok) return;
    }

    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      // 席順未設定の人を埋める
      const ordered = [...players].sort((a, b) => {
        const ai = a.seat_index ?? 999;
        const bi = b.seat_index ?? 999;
        if (ai !== bi) return ai - bi;
        return (a.created_at ?? "").localeCompare(b.created_at ?? "");
      });
      await startAndDeal(supabase, code, ordered);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "開始に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/room/${code}` : "";

  if (!room && !error) {
    return (
      <main className="mx-auto flex max-w-2xl flex-1 items-center justify-center p-8 text-muted">
        読み込み中…
      </main>
    );
  }

  if (!room) {
    return (
      <main className="mx-auto max-w-lg space-y-4 p-8">
        <p className="text-[#f0a0a0]">{error ?? "部屋がありません"}</p>
        <Link href="/" className="text-mint underline">
          トップへ
        </Link>
      </main>
    );
  }

  // 招待リンク直開き：まだ参加者でない場合は名前入力
  if (loaded && room.phase === "LOBBY" && !me) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-mint">部屋 {code}</p>
          <h1 className="text-2xl font-bold">参加する</h1>
          <p className="text-sm text-muted">
            表示名を入れて入室してください。いま {players.length} / {MAX_PLAYERS} 人です。
          </p>
        </header>

        <label className="block space-y-1">
          <span className="text-sm text-muted">表示名</span>
          <input
            className="w-full rounded-xl border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder="例: はるき"
            maxLength={24}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void joinFromInvite();
            }}
          />
        </label>

        <button
          type="button"
          disabled={busy || players.length >= MAX_PLAYERS}
          onClick={() => void joinFromInvite()}
          className="rounded-xl bg-gradient-to-r from-[#6ea8ff] via-[#ff8ec8] to-[#ffb086] px-4 py-3 text-sm font-bold text-[#12122a] disabled:opacity-40"
        >
          この部屋に入る
        </button>

        {players.length > 0 && (
          <p className="text-sm text-muted">
            参加中: {players.map((p) => p.display_name).join("、")}
          </p>
        )}

        {error && <p className="text-sm text-[#f0a0a0]">{error}</p>}

        <Link href="/" className="text-sm text-mint underline">
          トップへ
        </Link>
      </main>
    );
  }

  const sortedPlayers = [...players].sort((a, b) => {
    const ai = a.seat_index ?? 999;
    const bi = b.seat_index ?? 999;
    if (ai !== bi) return ai - bi;
    return (a.created_at ?? "").localeCompare(b.created_at ?? "");
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-wide text-mint">部屋 {code}</p>
        <h1 className="text-2xl font-bold">
          {room.phase === "LOBBY"
            ? "ロビー"
            : room.phase === "PLAYING"
              ? "プレイ中"
              : room.phase === "SELECTING"
                ? "価値観を選ぶ"
                : room.phase === "WRITING"
                  ? "理由を書く"
                  : room.phase === "RESULT" || room.phase === "CLOSED"
                    ? "結果"
                    : room.phase}
        </h1>
      </header>

      {room.phase === "LOBBY" && (
        <>
          <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
            <h2 className="text-sm font-semibold text-accent">招待</h2>

            <div className="space-y-2">
              <p className="text-xs text-muted">部屋コード</p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="rounded-xl bg-background px-3 py-2 text-lg font-bold tracking-[0.2em]">
                  {code}
                </p>
                <button
                  type="button"
                  className="rounded-xl border border-line px-3 py-2 text-sm"
                  onClick={() => void copyText("code", code)}
                >
                  {copied === "code" ? "コピーしました" : "部屋コードをコピー"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted">招待リンク</p>
              <p className="break-all rounded-xl bg-background px-3 py-2 text-sm">{shareUrl}</p>
              <button
                type="button"
                className="rounded-xl border border-line px-3 py-2 text-sm"
                onClick={() => void copyText("link", shareUrl)}
              >
                {copied === "link" ? "コピーしました" : "リンクをコピー"}
              </button>
            </div>

            <p className="text-xs text-muted">
              人数 {players.length} / {MAX_PLAYERS}（開始は{MIN_PLAYERS}人以上、おすすめ
              {MIN_PLAYERS}〜{RECOMMENDED_MAX}）
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-panel p-4 space-y-3">
            <h2 className="text-sm font-semibold text-accent">席順（隣＝次の人）</h2>
            <ul className="space-y-2">
              {sortedPlayers.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-background px-3 py-2"
                >
                  <div>
                    <span className="font-semibold">
                      {i + 1}. {p.display_name}
                    </span>
                    {p.is_host && (
                      <span className="ml-2 text-xs text-mint">ホスト</span>
                    )}
                    {p.id === playerId && (
                      <span className="ml-2 text-xs text-accent">あなた</span>
                    )}
                  </div>
                  {me?.is_host && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={busy || i === 0}
                        className="rounded-lg border border-line px-2 py-1 text-xs disabled:opacity-30"
                        onClick={() => void moveSeat(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === sortedPlayers.length - 1}
                        className="rounded-lg border border-line px-2 py-1 text-xs disabled:opacity-30"
                        onClick={() => void moveSeat(i, 1)}
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {me?.is_host ? (
            <button
              type="button"
              disabled={busy || players.length < MIN_PLAYERS}
              onClick={() => void startGame()}
              className="rounded-xl bg-gradient-to-r from-[#6ea8ff] via-[#ff8ec8] to-[#ffb086] px-4 py-3 text-sm font-bold text-[#12122a] disabled:opacity-40"
            >
              ゲームを開始する
            </button>
          ) : (
            <p className="text-sm text-muted">ホストの開始待ちです。</p>
          )}
        </>
      )}

      {room.phase === "PLAYING" && me && (
        <PlayingView
          room={room}
          players={players}
          me={me}
          onChanged={refresh}
        />
      )}

      {room.phase === "PLAYING" && !me && (
        <section className="rounded-2xl border border-accent bg-panel p-5 space-y-3">
          <h2 className="font-semibold text-accent">このブラウザでは参加者として認識できていません</h2>
          <p className="text-sm text-muted leading-relaxed">
            別の窓・シークレット・端末で開いている可能性があります。トップに戻り、同じ部屋コードで
            <strong className="text-foreground">表示名を入れて再入室</strong>
            してください（開始後は通常入室できません）。まずは
            <strong className="text-foreground">新しい部屋</strong>
            を作り直すのが確実です。
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-accent px-4 py-2 text-sm font-bold text-[#1c2421]"
          >
            トップへ戻る
          </Link>
        </section>
      )}

      {(room.phase === "SELECTING" ||
        room.phase === "WRITING" ||
        room.phase === "RESULT" ||
        room.phase === "CLOSED") &&
        me && (
          <EndgameView
            room={room}
            players={players}
            me={me}
            onChanged={refresh}
          />
        )}

      {(room.phase === "SELECTING" ||
        room.phase === "WRITING" ||
        room.phase === "RESULT" ||
        room.phase === "CLOSED") &&
        !me && (
          <section className="rounded-2xl border border-line bg-panel p-5 space-y-2">
            <h2 className="font-semibold text-accent">参加者情報が見つかりません</h2>
            <p className="text-sm text-muted">トップから入り直すか、新しい部屋を作ってください。</p>
            <Link href="/" className="text-sm text-mint underline">
              トップへ
            </Link>
          </section>
        )}

      {error && <p className="text-sm text-[#f0a0a0]">{error}</p>}

      <Link href="/" className="text-sm text-mint underline">
        トップへ
      </Link>
    </main>
  );
}
