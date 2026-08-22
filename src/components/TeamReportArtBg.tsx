"use client";

import { useMemo } from "react";
import { resolveMainAndSubCardIds, type TeamSnapshot } from "@/lib/team-report";

type Layout = {
  top: string;
  size: number;
  rotate: number;
  opacity: number;
  left?: string;
  right?: string;
};

/** メイン: 少し小さく・薄く、縦位置をばらす */
const MAIN_LAYOUTS: Layout[] = [
  { top: "2%", left: "32%", size: 210, rotate: -8, opacity: 0.2 },
  { top: "18%", left: "-8%", size: 190, rotate: 12, opacity: 0.18 },
  { top: "38%", right: "-10%", size: 200, rotate: -14, opacity: 0.19 },
  { top: "55%", left: "6%", size: 180, rotate: 10, opacity: 0.17 },
  { top: "72%", right: "2%", size: 185, rotate: -12, opacity: 0.17 },
  { top: "88%", left: "28%", size: 170, rotate: 6, opacity: 0.16 },
];

/** サブ: もう一段階大きく、縦もずらす */
const SUB_LAYOUTS: Layout[] = [
  { top: "0%", left: "-2%", size: 108, rotate: -22, opacity: 0.1 },
  { top: "12%", right: "-3%", size: 102, rotate: 18, opacity: 0.09 },
  { top: "28%", left: "-4%", size: 98, rotate: 24, opacity: 0.09 },
  { top: "44%", right: "-2%", size: 106, rotate: -16, opacity: 0.09 },
  { top: "60%", left: "-3%", size: 100, rotate: -20, opacity: 0.08 },
  { top: "76%", right: "-4%", size: 104, rotate: 20, opacity: 0.09 },
  { top: "8%", left: "48%", size: 92, rotate: 8, opacity: 0.08 },
  { top: "34%", left: "42%", size: 90, rotate: -12, opacity: 0.07 },
  { top: "68%", left: "46%", size: 96, rotate: 14, opacity: 0.08 },
  { top: "92%", left: "38%", size: 94, rotate: -10, opacity: 0.07 },
];

type Props = {
  snapshot: TeamSnapshot;
};

export function TeamReportArtBg({ snapshot }: Props) {
  const { mains, subs } = useMemo(
    () => resolveMainAndSubCardIds(snapshot),
    [snapshot],
  );
  if (mains.length === 0 && subs.length === 0) return null;

  return (
    <div
      aria-hidden
      data-bg-art
      className="pointer-events-none inset-0 overflow-hidden"
    >
      {mains.slice(0, MAIN_LAYOUTS.length).map((id, i) => {
        const layout = MAIN_LAYOUTS[i];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`main-${id}-${i}`}
            src={`/illustrations/v3/${id}.svg?v=20260822i`}
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
      {subs.slice(0, SUB_LAYOUTS.length).map((id, i) => {
        const layout = SUB_LAYOUTS[i];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`sub-${id}-${i}`}
            src={`/illustrations/v3/${id}.svg?v=20260822i`}
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
