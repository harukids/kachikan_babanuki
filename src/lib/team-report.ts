import { DECK, getCard, PILLAR_LABEL } from "@/lib/deck";
import type { Pillar, Player } from "@/lib/types";

export const MAX_TEAM_GROUPS = 4;

export type TeamMemberSnapshot = {
  id: string;
  displayName: string;
  mainCardId?: string | null;
  mainLabel: string | null;
  mainPillar: Pillar | null;
  subLabels: string[];
};

export type TeamSnapshot = {
  roomCode: string;
  groupLabel: string;
  memberCount: number;
  members: TeamMemberSnapshot[];
  pillarMain: Record<Pillar, number>;
  pillarAll: Record<Pillar, number>;
};

export function emptyPillarCounts(): Record<Pillar, number> {
  return { heart: 0, work: 0, growth: 0 };
}

/** スナップショットからメインカードIDを復元（旧データはラベルから推定） */
export function resolveMainCardIds(snapshot: TeamSnapshot): string[] {
  const ids: string[] = [];
  for (const m of snapshot.members) {
    if (m.mainCardId) {
      ids.push(m.mainCardId);
      continue;
    }
    if (!m.mainLabel) continue;
    const hit = DECK.find((c) => c.label === m.mainLabel);
    if (hit) ids.push(hit.id);
  }
  return ids;
}

export function buildTeamSnapshot(
  roomCode: string,
  groupLabel: string,
  members: Player[],
): TeamSnapshot {
  const pillarMain = emptyPillarCounts();
  const pillarAll = emptyPillarCounts();
  const memberSnaps: TeamMemberSnapshot[] = [];

  for (const p of members) {
    const main = p.main_card_id ? getCard(p.main_card_id) : null;
    const subs = (p.sub_card_ids ?? [])
      .map((id) => getCard(id))
      .filter(Boolean);

    if (main) {
      pillarMain[main.pillar] += 1;
      pillarAll[main.pillar] += 1;
    }
    for (const s of subs) {
      if (s) pillarAll[s.pillar] += 1;
    }

    memberSnaps.push({
      id: p.id,
      displayName: p.display_name,
      mainCardId: p.main_card_id,
      mainLabel: main?.label ?? null,
      mainPillar: main?.pillar ?? null,
      subLabels: subs.map((s) => s!.label),
    });
  }

  return {
    roomCode,
    groupLabel,
    memberCount: members.length,
    members: memberSnaps,
    pillarMain,
    pillarAll,
  };
}

export function pillarSummaryLines(snapshot: TeamSnapshot): string[] {
  const lines: string[] = [];
  lines.push(`対象: このチーム（${snapshot.memberCount}人）`);
  lines.push(`内部ラベル: ${snapshot.groupLabel}`);
  lines.push("メインの柱:");
  (["heart", "work", "growth"] as Pillar[]).forEach((p) => {
    lines.push(`- ${PILLAR_LABEL[p]}: ${snapshot.pillarMain[p]}`);
  });
  lines.push("メイン＋サブの柱:");
  (["heart", "work", "growth"] as Pillar[]).forEach((p) => {
    lines.push(`- ${PILLAR_LABEL[p]}: ${snapshot.pillarAll[p]}`);
  });
  lines.push("各自のメイン:");
  for (const m of snapshot.members) {
    lines.push(
      `- ${m.displayName}: ${m.mainLabel ?? "未設定"}${
        m.mainPillar ? `（${PILLAR_LABEL[m.mainPillar]}）` : ""
      }`,
    );
  }
  return lines;
}

export function assertAdminSecret(provided: string | null | undefined): void {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) {
    throw new Error("ADMIN_SECRET がサーバーに設定されていません");
  }
  if (!provided || provided !== expected) {
    throw new Error("合言葉が違います");
  }
}
