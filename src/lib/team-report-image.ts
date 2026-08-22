import { PILLAR_LABEL } from "@/lib/deck";
import { resolveMainAndSubCardIds, type TeamSnapshot } from "@/lib/team-report";
import type { Pillar } from "@/lib/types";

const PILLAR_COLORS: Record<Pillar, string> = {
  heart: "#ff8ec8",
  work: "#6ea8ff",
  growth: "#7ef0d4",
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function downloadTeamReportImage(input: {
  groupLabel: string;
  roomCode: string;
  snapshot: TeamSnapshot;
  analysis: string;
  createdAt?: string;
}): Promise<void> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画像を作れませんでした");

  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#0b1020");
  bg.addColorStop(0.45, "#161a38");
  bg.addColorStop(1, "#1a1230");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // メインは少し小さく薄く・縦をばらす / サブは装飾で一段大きく
  const { mains, subs } = resolveMainAndSubCardIds(input.snapshot);
  const mainLayouts = [
    { x: 380, y: 40, s: 280, r: -8 },
    { x: 20, y: 280, s: 250, r: 12 },
    { x: 740, y: 480, s: 270, r: -14 },
    { x: 80, y: 700, s: 240, r: 10 },
    { x: 700, y: 920, s: 250, r: -12 },
    { x: 360, y: 1080, s: 230, r: 6 },
  ];
  const subLayouts = [
    { x: 10, y: 20, s: 130, r: -22 },
    { x: 920, y: 140, s: 120, r: 18 },
    { x: 20, y: 400, s: 115, r: 26 },
    { x: 930, y: 560, s: 125, r: -14 },
    { x: 5, y: 820, s: 118, r: -20 },
    { x: 940, y: 980, s: 122, r: 22 },
    { x: 480, y: 180, s: 110, r: 8 },
    { x: 500, y: 620, s: 108, r: -12 },
    { x: 460, y: 880, s: 115, r: 14 },
    { x: 490, y: 1200, s: 112, r: -10 },
  ];

  for (let i = 0; i < Math.min(mains.length, mainLayouts.length); i++) {
    const img = await loadImage(`/illustrations/v3/${mains[i]}.svg?v=20260822i`);
    if (!img) continue;
    const L = mainLayouts[i];
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.translate(L.x + L.s / 2, L.y + L.s / 2);
    ctx.rotate((L.r * Math.PI) / 180);
    ctx.drawImage(img, -L.s / 2, -L.s / 2, L.s, L.s);
    ctx.restore();
  }
  for (let i = 0; i < Math.min(subs.length, subLayouts.length); i++) {
    const img = await loadImage(`/illustrations/v3/${subs[i]}.svg?v=20260822i`);
    if (!img) continue;
    const L = subLayouts[i];
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.translate(L.x + L.s / 2, L.y + L.s / 2);
    ctx.rotate((L.r * Math.PI) / 180);
    ctx.drawImage(img, -L.s / 2, -L.s / 2, L.s, L.s);
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 4;
  roundRect(ctx, 48, 48, width - 96, height - 96, 36);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ef0d4";
  ctx.font = "600 28px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("Value Drop · チームレポート", width / 2, 120);

  ctx.fillStyle = "#f4f7ff";
  ctx.font = "700 48px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(input.groupLabel, width / 2, 190);

  ctx.fillStyle = "#b7c0d9";
  ctx.font = "500 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(
    `部屋 ${input.roomCode} · ${input.snapshot.memberCount}人`,
    width / 2,
    235,
  );

  // Pillar bars (main+sub)
  const pillars: Pillar[] = ["heart", "work", "growth"];
  const total =
    pillars.reduce((s, p) => s + (input.snapshot.pillarAll[p] ?? 0), 0) || 1;
  let barY = 300;
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffe28a";
  ctx.font = "700 26px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("柱の偏り（メイン＋サブ）", 120, barY);
  barY += 36;

  for (const p of pillars) {
    const count = input.snapshot.pillarAll[p] ?? 0;
    const ratio = count / total;
    ctx.fillStyle = "#dce6ff";
    ctx.font = "600 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    ctx.fillText(PILLAR_LABEL[p], 120, barY + 22);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, 320, barY, 640, 28, 10);
    ctx.fill();
    ctx.fillStyle = PILLAR_COLORS[p];
    roundRect(ctx, 320, barY, Math.max(8, 640 * ratio), 28, 10);
    ctx.fill();
    ctx.fillStyle = "#f4f7ff";
    ctx.font = "500 20px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    ctx.fillText(`${count}`, 980, barY + 22);
    barY += 52;
  }

  // Mains
  barY += 20;
  ctx.fillStyle = "#ffe28a";
  ctx.font = "700 26px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("各自のメイン", 120, barY);
  barY += 40;
  ctx.fillStyle = "#eef2ff";
  ctx.font = "500 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  for (const m of input.snapshot.members) {
    const line = `${m.displayName}  —  ${m.mainLabel ?? "—"}${
      m.mainPillar ? `（${PILLAR_LABEL[m.mainPillar]}）` : ""
    }`;
    ctx.fillText(line, 120, barY);
    barY += 40;
    if (barY > 780) break;
  }

  // Analysis box
  const boxTop = Math.max(barY + 24, 820);
  const boxH = 1260 - boxTop - 40;
  const boxX = 100;
  const boxW = width - 200;
  ctx.fillStyle = "rgba(10, 12, 28, 0.55)";
  roundRect(ctx, boxX, boxTop, boxW, boxH, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,226,138,0.45)";
  ctx.lineWidth = 2;
  roundRect(ctx, boxX, boxTop, boxW, boxH, 24);
  ctx.stroke();

  ctx.fillStyle = "#ffe28a";
  ctx.font = "700 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("チーム分析", width / 2, boxTop + 42);

  const analysis = (input.analysis || "（分析なし）").trim();
  const lines = wrapSimple(ctx, analysis, width - 280, 26);
  ctx.fillStyle = "#eef2ff";
  ctx.font = "500 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.textBaseline = "top";
  lines.slice(0, 8).forEach((line, i) => {
    ctx.fillText(line, width / 2, boxTop + 70 + i * 34);
  });
  ctx.textBaseline = "alphabetic";

  const date = input.createdAt
    ? new Date(input.createdAt).toLocaleDateString("ja-JP")
    : new Date().toLocaleDateString("ja-JP");
  ctx.fillStyle = "#98a8d0";
  ctx.font = "500 20px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(date, width / 2, 1295);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("画像の保存に失敗しました"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ValueDrop_${input.groupLabel}_${input.roomCode}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapSimple(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
): string[] {
  ctx.font = `500 ${fontSize}px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif`;
  const chars = [...text];
  const lines: string[] = [];
  let line = "";
  for (const ch of chars) {
    if (ch === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
