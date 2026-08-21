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

/** メイン: 個人ポスターに近い存在感 */
const MAIN_LAYOUTS: Layout[] = [
  { top: "6%", left: "28%", size: 280, rotate: -8, opacity: 0.28 },
  { top: "28%", left: "-6%", size: 250, rotate: 12, opacity: 0.26 },
  { top: "26%", right: "-8%", size: 260, rotate: -14, opacity: 0.26 },
  { top: "52%", left: "8%", size: 230, rotate: 10, opacity: 0.24 },
  { top: "50%", right: "4%", size: 240, rotate: -12, opacity: 0.24 },
  { top: "72%", left: "30%", size: 220, rotate: 6, opacity: 0.22 },
];

/** サブ: 端の装飾 */
const SUB_LAYOUTS: Layout[] = [
  { top: "2%", left: "-2%", size: 90, rotate: -22, opacity: 0.1 },
  { top: "4%", right: "-3%", size: 85, rotate: 18, opacity: 0.09 },
  { top: "22%", left: "-4%", size: 80, rotate: 24, opacity: 0.09 },
  { top: "40%", right: "-2%", size: 88, rotate: -16, opacity: 0.09 },
  { top: "58%", left: "-3%", size: 82, rotate: -20, opacity: 0.08 },
  { top: "64%", right: "-4%", size: 86, rotate: 20, opacity: 0.09 },
  { top: "80%", left: "2%", size: 78, rotate: 12, opacity: 0.08 },
  { top: "84%", right: "1%", size: 84, rotate: -14, opacity: 0.08 },
  { top: "12%", left: "42%", size: 70, rotate: 8, opacity: 0.07 },
  { top: "88%", left: "40%", size: 72, rotate: -10, opacity: 0.07 },
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
            src={`/illustrations/v3/${id}.svg?v=20260822h`}
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
            src={`/illustrations/v3/${id}.svg?v=20260822h`}
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
