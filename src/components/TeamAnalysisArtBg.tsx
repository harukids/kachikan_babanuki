"use client";

import { useMemo } from "react";
import { resolveMainCardIds, type TeamSnapshot } from "@/lib/team-report";

type Layout = {
  top: string;
  size: number;
  rotate: number;
  left?: string;
  right?: string;
};

/** チーム分析ボックス背景用の線画散らし */
const LAYOUTS: Layout[] = [
  { top: "8%", left: "-4%", size: 110, rotate: -18 },
  { top: "12%", right: "-6%", size: 120, rotate: 14 },
  { top: "42%", left: "-8%", size: 100, rotate: 22 },
  { top: "48%", right: "-4%", size: 115, rotate: -12 },
  { top: "72%", left: "6%", size: 95, rotate: -28 },
  { top: "70%", right: "4%", size: 105, rotate: 20 },
  { top: "28%", left: "38%", size: 90, rotate: 8 },
  { top: "58%", left: "42%", size: 88, rotate: -16 },
];

type Props = {
  snapshot: TeamSnapshot;
};

export function TeamAnalysisArtBg({ snapshot }: Props) {
  const cardIds = useMemo(() => resolveMainCardIds(snapshot), [snapshot]);
  if (cardIds.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
    >
      {cardIds.slice(0, LAYOUTS.length).map((id, i) => {
        const layout = LAYOUTS[i % LAYOUTS.length];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${id}-${i}`}
            src={`/illustrations/v3/${id}.svg?v=20260822f`}
            alt=""
            className="absolute select-none"
            style={{
              top: layout.top,
              left: layout.left,
              right: layout.right,
              width: layout.size,
              height: layout.size,
              opacity: 0.14,
              transform: `rotate(${layout.rotate}deg)`,
            }}
            draggable={false}
          />
        );
      })}
    </div>
  );
}
