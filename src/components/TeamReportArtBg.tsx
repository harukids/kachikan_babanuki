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

/** メイン: 少し小さく・薄く、縦位置を互い違いに */
const MAIN_LAYOUTS: Layout[] = [
  { top: "2%", left: "22%", size: 220, rotate: -10, opacity: 0.2 },
  { top: "18%", right: "-10%", size: 200, rotate: 14, opacity: 0.18 },
  { top: "36%", left: "-10%", size: 210, rotate: -16, opacity: 0.19 },
  { top: "54%", right: "-6%", size: 190, rotate: 11, opacity: 0.17 },
  { top: "70%", left: "6%", size: 185, rotate: -8, opacity: 0.17 },
  { top: "86%", right: "10%", size: 175, rotate: 9, opacity: 0.16 },
];

/** サブ: 一段階大きく、端で装飾 */
const SUB_LAYOUTS: Layout[] = [
  { top: "0%", left: "-3%", size: 108, rotate: -24, opacity: 0.1 },
  { top: "10%", right: "-4%", size: 102, rotate: 20, opacity: 0.09 },
  { top: "26%", left: "-5%", size: 98, rotate: 26, opacity: 0.09 },
  { top: "42%", right: "-3%", size: 106, rotate: -18, opacity: 0.09 },
  { top: "58%", left: "-4%", size: 100, rotate: -22, opacity: 0.08 },
  { top: "74%", right: "-5%", size: 104, rotate: 22, opacity: 0.09 },
  { top: "90%", left: "0%", size: 96, rotate: 14, opacity: 0.08 },
  { top: "48%", left: "42%", size: 88, rotate: -12, opacity: 0.07 },
  { top: "8%", left: "44%", size: 86, rotate: 8, opacity: 0.07 },
  { top: "82%", left: "40%", size: 90, rotate: -10, opacity: 0.07 },
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
