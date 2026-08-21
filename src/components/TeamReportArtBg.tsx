"use client";

import { useMemo } from "react";
import { resolveValueCardIds, type TeamSnapshot } from "@/lib/team-report";

type Layout = {
  top: string;
  size: number;
  rotate: number;
  opacity: number;
  left?: string;
  right?: string;
};

/** チームレポート全体背景用（メイン＋サブ） */
const LAYOUTS: Layout[] = [
  { top: "4%", left: "-3%", size: 150, rotate: -20, opacity: 0.13 },
  { top: "3%", right: "-4%", size: 140, rotate: 16, opacity: 0.12 },
  { top: "18%", left: "-5%", size: 120, rotate: 24, opacity: 0.11 },
  { top: "16%", right: "-3%", size: 130, rotate: -14, opacity: 0.12 },
  { top: "34%", left: "2%", size: 110, rotate: -28, opacity: 0.1 },
  { top: "36%", right: "1%", size: 125, rotate: 18, opacity: 0.11 },
  { top: "52%", left: "-4%", size: 135, rotate: 12, opacity: 0.12 },
  { top: "50%", right: "-5%", size: 145, rotate: -22, opacity: 0.12 },
  { top: "68%", left: "4%", size: 115, rotate: -10, opacity: 0.1 },
  { top: "70%", right: "3%", size: 120, rotate: 26, opacity: 0.11 },
  { top: "84%", left: "-2%", size: 130, rotate: 8, opacity: 0.1 },
  { top: "82%", right: "-3%", size: 140, rotate: -16, opacity: 0.11 },
  { top: "8%", left: "40%", size: 100, rotate: 6, opacity: 0.09 },
  { top: "44%", left: "42%", size: 95, rotate: -18, opacity: 0.09 },
  { top: "76%", left: "38%", size: 105, rotate: 14, opacity: 0.09 },
];

type Props = {
  snapshot: TeamSnapshot;
};

export function TeamReportArtBg({ snapshot }: Props) {
  const cardIds = useMemo(() => resolveValueCardIds(snapshot), [snapshot]);
  if (cardIds.length === 0) return null;

  return (
    <div
      aria-hidden
      data-bg-art
      className="pointer-events-none inset-0 overflow-hidden"
    >
      {cardIds.slice(0, LAYOUTS.length).map((id, i) => {
        const layout = LAYOUTS[i % LAYOUTS.length];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${id}-${i}`}
            src={`/illustrations/v3/${id}.svg?v=20260822g`}
            alt=""
            className="absolute select-none"
            style={{
              top: layout.top,
              left: layout.left,
              right: layout.right,
              width: layout.size,
              height: layout.size,
              opacity: layout.opacity,
              transform: `rotate(${layout.rotate}deg)`,
            }}
            draggable={false}
          />
        );
      })}
    </div>
  );
}
