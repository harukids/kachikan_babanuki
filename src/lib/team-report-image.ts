import { DECK, PILLAR_LABEL, getCard } from "@/lib/deck";
import {
  resolveSubCardsWithOwners,
  type TeamMemberSnapshot,
  type TeamSnapshot,
} from "@/lib/team-report";
import { getValueCardPillarTone } from "@/lib/result-poster";
import type { Pillar } from "@/lib/types";

const PILLAR_COLORS: Record<Pillar, string> = {
  heart: "#ff8ec8",
  work: "#6ea8ff",
  growth: "#7ef0d4",
};

const CACHE = "20260822i";

function findIdByLabel(label: string | null | undefined): string | null {
  if (!label) return null;
  return DECK.find((c) => c.label === label)?.id ?? null;
}

function memberMainId(m: TeamMemberSnapshot): string | null {
  return m.mainCardId || findIdByLabel(m.mainLabel);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawValueCard(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    w: number;
    cardId: string;
    title: string;
    owner?: string;
    compact?: boolean;
  },
): Promise<number> {
  const { x, y, w, cardId, title, owner, compact } = opts;
  const card = getCard(cardId);
  const tone = getValueCardPillarTone(card?.pillar);
  const pad = compact ? 10 : 14;
  const artSize = w - pad * 2;
  const captionH = owner ? (compact ? 44 : 52) : compact ? 28 : 36;
  const h = pad + artSize + captionH;

  ctx.save();

  const fill =
    card?.pillar === "work"
      ? "#101828"
      : card?.pillar === "growth"
        ? "#0e1a16"
        : "#1a1018";
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = tone.border;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();

  const innerX = x + pad;
  const innerY = y + pad;
  const grad = ctx.createLinearGradient(
    innerX,
    innerY,
    innerX + artSize,
    innerY + artSize,
  );
  grad.addColorStop(0, tone.artFrom);
  grad.addColorStop(1, tone.artTo);
  ctx.fillStyle = grad;
  roundRect(ctx, innerX, innerY, artSize, artSize, 14);
  ctx.fill();

  const img = await loadImage(`/illustrations/v3/${cardId}.svg?v=${CACHE}`);
  if (img) {
    const inset = compact ? 8 : 12;
    ctx.drawImage(
      img,
      innerX + inset,
      innerY + inset,
      artSize - inset * 2,
      artSize - inset * 2,
    );
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const titleSize = compact ? 15 : 18;
  ctx.fillStyle = "#f4f7ff";
  ctx.font = `600 ${titleSize}px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif`;
  const titleLines = wrapSimple(ctx, title, w - 16, titleSize).slice(0, 2);
  let textY = y + pad + artSize + 8;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, textY + i * (titleSize + 2));
  });
  textY += titleLines.length * (titleSize + 2) + 2;

  if (owner) {
    ctx.fillStyle = "#98a8d0";
    const ownerSize = compact ? 12 : 14;
    ctx.font = `500 ${ownerSize}px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif`;
    ctx.fillText(owner, x + w / 2, textY);
  }

  ctx.restore();
  return h;
}

export async function downloadTeamReportImage(input: {
  groupLabel: string;
  roomCode: string;
  snapshot: TeamSnapshot;
  analysis: string;
  createdAt?: string;
}): Promise<void> {
  const width = 1080;
  const height = 1600;
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

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 4;
  roundRect(ctx, 40, 40, width - 80, height - 80, 36);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#7ef0d4";
  ctx.font = "600 26px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("Value Drop · チームレポート", width / 2, 100);

  ctx.fillStyle = "#f4f7ff";
  ctx.font = "700 44px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(input.groupLabel, width / 2, 160);

  ctx.fillStyle = "#b7c0d9";
  ctx.font = "500 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(
    `部屋 ${input.roomCode} · ${input.snapshot.memberCount}人`,
    width / 2,
    205,
  );

  let y = 250;
  const contentLeft = 80;
  const contentRight = width - 80;
  const contentWidth = contentRight - contentLeft;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffe28a";
  ctx.font = "700 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("このチームのメイン価値観", contentLeft, y);
  y += 28;

  const members = input.snapshot.members;
  const cols = Math.min(4, Math.max(2, members.length || 2));
  const gap = 20;
  const cardW = (contentWidth - gap * (cols - 1)) / cols;
  let col = 0;
  let rowY = y;
  let rowH = 0;
  for (const m of members) {
    const mainId = memberMainId(m);
    if (!mainId) continue;
    const x = contentLeft + col * (cardW + gap);
    const h = await drawValueCard(ctx, {
      x,
      y: rowY,
      w: cardW,
      cardId: mainId,
      title: m.mainLabel ?? getCard(mainId)?.label ?? "",
      owner: m.displayName,
    });
    rowH = Math.max(rowH, h);
    col += 1;
    if (col >= cols) {
      col = 0;
      rowY += rowH + gap;
      rowH = 0;
    }
  }
  if (col > 0) rowY += rowH + gap;
  y = rowY + 10;

  const subs = resolveSubCardsWithOwners(input.snapshot);
  if (subs.length > 0) {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffe28a";
    ctx.font = "700 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    ctx.fillText("サブ", contentLeft, y);
    y += 24;
    const subCols = Math.min(6, Math.max(3, subs.length));
    const subGap = 14;
    const subW = (contentWidth - subGap * (subCols - 1)) / subCols;
    col = 0;
    rowY = y;
    rowH = 0;
    for (const s of subs.slice(0, 12)) {
      const x = contentLeft + col * (subW + subGap);
      const h = await drawValueCard(ctx, {
        x,
        y: rowY,
        w: subW,
        cardId: s.cardId,
        title: s.label,
        owner: s.owners.join("、"),
        compact: true,
      });
      rowH = Math.max(rowH, h);
      col += 1;
      if (col >= subCols) {
        col = 0;
        rowY += rowH + subGap;
        rowH = 0;
      }
    }
    if (col > 0) rowY += rowH + subGap;
    y = rowY + 8;
  }

  const pillars: Pillar[] = ["heart", "work", "growth"];
  const total =
    pillars.reduce((s, p) => s + (input.snapshot.pillarAll[p] ?? 0), 0) || 1;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffe28a";
  ctx.font = "700 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("柱の偏り（メイン＋サブ）", contentLeft, y);
  y += 28;

  const labelColW = 160;
  const countColW = 40;
  const barX = contentLeft + labelColW;
  const barW = contentWidth - labelColW - countColW - 16;
  const countX = contentRight;

  for (const p of pillars) {
    const count = input.snapshot.pillarAll[p] ?? 0;
    const ratio = count / total;
    ctx.textAlign = "left";
    ctx.fillStyle = "#dce6ff";
    ctx.font = "600 20px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    ctx.fillText(PILLAR_LABEL[p], contentLeft, y + 18);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(ctx, barX, y, barW, 24, 10);
    ctx.fill();
    ctx.fillStyle = PILLAR_COLORS[p];
    roundRect(ctx, barX, y, Math.max(8, barW * ratio), 24, 10);
    ctx.fill();
    ctx.textAlign = "right";
    ctx.fillStyle = "#f4f7ff";
    ctx.fillText(`${count}`, countX, y + 18);
    y += 42;
  }

  y += 12;
  const boxH = Math.min(280, height - 80 - y - 40);
  ctx.fillStyle = "rgba(10, 12, 28, 0.55)";
  roundRect(ctx, contentLeft, y, contentWidth, boxH, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,226,138,0.45)";
  ctx.lineWidth = 2;
  roundRect(ctx, contentLeft, y, contentWidth, boxH, 24);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffe28a";
  ctx.font = "700 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("チーム分析", width / 2, y + 36);

  const analysis = (input.analysis || "（分析なし）").trim();
  const lines = wrapSimple(ctx, analysis, contentWidth - 80, 22);
  ctx.fillStyle = "#eef2ff";
  ctx.font = "500 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.textBaseline = "top";
  lines.slice(0, 7).forEach((line, i) => {
    ctx.fillText(line, width / 2, y + 56 + i * 30);
  });
  ctx.textBaseline = "alphabetic";

  const date = input.createdAt
    ? new Date(input.createdAt).toLocaleDateString("ja-JP")
    : new Date().toLocaleDateString("ja-JP");
  ctx.textAlign = "center";
  ctx.fillStyle = "#98a8d0";
  ctx.font = "500 20px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(date, width / 2, height - 55);

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
