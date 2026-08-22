"use client";

import { useMemo } from "react";
import { resolveMainAndSubCardIds, type TeamSnapshot } from "@/lib/team-report";

type Layout = {
  top: string;
  size: number;
  /** スマホでの最大幅（vw） */
  maxVw: number;
  rotate: number;
  opacity: number;
  left?: string;
  right?: string;
};

/** メイン: 一段階小さく・薄く（スマホではさらに抑える） */
const MAIN_LAYOUTS: Layout[] = [
  { top: "5%", left: "30%", size: 210, maxVw: 46, rotate: -8, opacity: 0.2 },
  { top: "30%", left: "-5%", size: 190, maxVw: 42, rotate: 12, opacity: 0.18 },
  { top: "28%", right: "-6%", size: 200, maxVw: 44, rotate: -14, opacity: 0.18 },
  { top: "54%", left: "10%", size: 175, maxVw: 40, rotate: 10, opacity: 0.17 },
  { top: "52%", right: "6%", size: 180, maxVw: 40, rotate: -12, opacity: 0.17 },
  { top: "74%", left: "32%", size: 165, maxVw: 38, rotate: 6, opacity: 0.16 },
];

/** サブ: 一段階大きく（装飾として端に） */
const SUB_LAYOUTS: Layout[] = [
  { top: "2%", left: "-3%", size: 115, maxVw: 28, rotate: -22, opacity: 0.12 },
  { top: "3%", right: "-4%", size: 110, maxVw: 27, rotate: 18, opacity: 0.11 },
  { top: "20%", left: "-5%", size: 105, maxVw: 26, rotate: 24, opacity: 0.11 },
  { top: "38%", right: "-3%", size: 112, maxVw: 27, rotate: -16, opacity: 0.11 },
  { top: "56%", left: "-4%", size: 108, maxVw: 26, rotate: -20, opacity: 0.1 },
  { top: "62%", right: "-5%", size: 110, maxVw: 27, rotate: 20, opacity: 0.11 },
  { top: "78%", left: "1%", size: 100, maxVw: 25, rotate: 12, opacity: 0.1 },
  { top: "82%", right: "0%", size: 105, maxVw: 26, rotate: -14, opacity: 0.1 },
  { top: "14%", left: "44%", size: 95, maxVw: 22, rotate: 8, opacity: 0.09 },
  { top: "88%", left: "42%", size: 98, maxVw: 23, rotate: -10, opacity: 0.09 },
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
              width: `min(${layout.size}px, ${layout.maxVw}vw)`,
              height: "auto",
              aspectRatio: "1",
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
              width: `min(${layout.size}px, ${layout.maxVw}vw)`,
              height: "auto",
              aspectRatio: "1",
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
