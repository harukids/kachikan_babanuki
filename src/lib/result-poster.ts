import { getCard } from "@/lib/deck";
import type { Pillar } from "@/lib/types";

export type PosterInput = {
  displayName: string;
  mainCardId: string | null;
  subCardIds: string[];
  reason: string | null;
};

type PillarTheme = {
  night: [string, string, string, string];
  glows: Array<[number, number, number, string]>;
  band: string[];
  frame: string[];
  accentLine: string[];
  title: string;
  name: string;
  mainLabel: string;
  mainCaption: string;
  subFill: [string, string];
  subStroke: [string, string];
  reasonStroke: string;
  reasonTitle: string;
  footer: string;
};

/** 柱ごとのポスター配色（クライアント描画のみ・軽い） */
export const PILLAR_POSTER_THEME: Record<Pillar, PillarTheme> = {
  heart: {
    night: ["#1a0a14", "#3a1028", "#5a1838", "#1c0c18"],
    glows: [
      [200, 240, 500, "rgba(255,120,160,0.55)"],
      [820, 200, 460, "rgba(255,90,140,0.4)"],
      [700, 820, 500, "rgba(255,160,190,0.35)"],
      [260, 1000, 420, "rgba(255,200,160,0.28)"],
    ],
    band: [
      "rgba(255,120,160,0.0)",
      "rgba(255,100,150,0.2)",
      "rgba(255,140,180,0.18)",
      "rgba(255,180,160,0.12)",
      "rgba(255,120,160,0.0)",
    ],
    frame: [
      "rgba(255,140,180,0.9)",
      "rgba(255,100,150,0.85)",
      "rgba(255,180,160,0.85)",
      "rgba(255,220,200,0.8)",
    ],
    accentLine: ["#ff8eb4", "#ff6a9a", "#ffb08a"],
    title: "#ffd0e0",
    name: "#ffe8f0",
    mainLabel: "#ffffff",
    mainCaption: "#ff9aba",
    subFill: ["rgba(255,120,160,0.22)", "rgba(255,160,140,0.2)"],
    subStroke: ["rgba(255,140,180,0.75)", "rgba(255,180,150,0.7)"],
    reasonStroke: "rgba(255,200,180,0.4)",
    reasonTitle: "#ffc8a8",
    footer: "#c9a0ae",
  },
  work: {
    night: ["#070e1c", "#0e1a36", "#12304a", "#0a1224"],
    glows: [
      [180, 220, 500, "rgba(90,160,255,0.55)"],
      [860, 200, 460, "rgba(70,200,230,0.35)"],
      [720, 820, 500, "rgba(120,170,255,0.35)"],
      [240, 980, 420, "rgba(255,200,120,0.25)"],
    ],
    band: [
      "rgba(90,160,255,0.0)",
      "rgba(90,160,255,0.2)",
      "rgba(70,200,230,0.16)",
      "rgba(255,200,120,0.12)",
      "rgba(90,160,255,0.0)",
    ],
    frame: [
      "rgba(110,180,255,0.9)",
      "rgba(70,200,230,0.85)",
      "rgba(140,170,255,0.85)",
      "rgba(255,200,120,0.8)",
    ],
    accentLine: ["#6eb0ff", "#4ec8e0", "#ffc878"],
    title: "#c8dcff",
    name: "#e8f0ff",
    mainLabel: "#ffffff",
    mainCaption: "#7eb8ff",
    subFill: ["rgba(90,160,255,0.22)", "rgba(70,200,230,0.18)"],
    subStroke: ["rgba(110,180,255,0.75)", "rgba(70,200,230,0.7)"],
    reasonStroke: "rgba(255,200,120,0.4)",
    reasonTitle: "#ffd090",
    footer: "#8aa0c0",
  },
  growth: {
    night: ["#061410", "#0c2820", "#143828", "#0a1a14"],
    glows: [
      [200, 240, 500, "rgba(80,210,160,0.5)"],
      [840, 200, 460, "rgba(120,220,180,0.35)"],
      [700, 800, 500, "rgba(60,180,140,0.35)"],
      [260, 980, 420, "rgba(200,220,120,0.25)"],
    ],
    band: [
      "rgba(80,210,160,0.0)",
      "rgba(80,210,160,0.2)",
      "rgba(120,200,160,0.16)",
      "rgba(200,220,120,0.12)",
      "rgba(80,210,160,0.0)",
    ],
    frame: [
      "rgba(100,220,170,0.9)",
      "rgba(80,190,150,0.85)",
      "rgba(160,220,160,0.85)",
      "rgba(220,230,140,0.8)",
    ],
    accentLine: ["#5ed4a8", "#7ecf90", "#d4e878"],
    title: "#c8f0dc",
    name: "#e4fff4",
    mainLabel: "#ffffff",
    mainCaption: "#7ed9b0",
    subFill: ["rgba(80,210,160,0.22)", "rgba(160,210,120,0.18)"],
    subStroke: ["rgba(100,220,170,0.75)", "rgba(180,220,120,0.7)"],
    reasonStroke: "rgba(200,220,120,0.4)",
    reasonTitle: "#d4e878",
    footer: "#88b0a0",
  },
};

export function getPosterTheme(pillar: Pillar | null | undefined): PillarTheme {
  return PILLAR_POSTER_THEME[pillar ?? "heart"];
}

/** プレビュー用 Tailwind クラス */
export function getPosterPreviewClasses(pillar: Pillar | null | undefined): {
  card: string;
  title: string;
  main: string;
  button: string;
} {
  switch (pillar) {
    case "work":
      return {
        card: "border-sky-300/20 bg-gradient-to-br from-[#0e1a36]/90 via-[#12304a]/80 to-[#0a1224]/85 shadow-[0_0_40px_rgba(90,160,255,0.2)]",
        title: "text-sky-100/80",
        main: "bg-gradient-to-r from-[#6eb0ff] via-[#4ec8e0] to-[#ffc878] bg-clip-text text-transparent",
        button:
          "bg-gradient-to-r from-[#6eb0ff] via-[#4ec8e0] to-[#ffc878] text-[#0a1224]",
      };
    case "growth":
      return {
        card: "border-emerald-300/20 bg-gradient-to-br from-[#0c2820]/90 via-[#143828]/80 to-[#061410]/85 shadow-[0_0_40px_rgba(80,210,160,0.2)]",
        title: "text-emerald-100/80",
        main: "bg-gradient-to-r from-[#5ed4a8] via-[#7ecf90] to-[#d4e878] bg-clip-text text-transparent",
        button:
          "bg-gradient-to-r from-[#5ed4a8] via-[#7ecf90] to-[#d4e878] text-[#061410]",
      };
    case "heart":
    default:
      return {
        card: "border-rose-300/20 bg-gradient-to-br from-[#3a1028]/90 via-[#5a1838]/75 to-[#1a0a14]/85 shadow-[0_0_40px_rgba(255,120,160,0.22)]",
        title: "text-rose-100/80",
        main: "bg-gradient-to-r from-[#ff8eb4] via-[#ff6a9a] to-[#ffb08a] bg-clip-text text-transparent",
        button:
          "bg-gradient-to-r from-[#ff8eb4] via-[#ff6a9a] to-[#ffb08a] text-[#1a0a14]",
      };
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const chars = [...text];
  const lines: string[] = [];
  let line = "";
  for (const ch of chars) {
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

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** A案: 静的アセット。カード専用 → 柱フォールバックの順で探す */
async function loadLineArt(cardId: string, pillar: Pillar): Promise<HTMLImageElement | null> {
  const candidates = [
    `/illustrations/${cardId}.svg`,
    `/illustrations/${cardId}.png`,
    `/illustrations/pillar-${pillar}.svg`,
    `/illustrations/pillar-${pillar}.png`,
  ];
  for (const src of candidates) {
    const img = await loadImage(src);
    if (img) return img;
  }
  return null;
}

/** 壁に貼れる縦ポスター（PNG）を生成してダウンロード */
export async function downloadResultPoster(input: PosterInput): Promise<void> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading failures
    }
  }

  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画像を作れませんでした");

  const main = input.mainCardId ? getCard(input.mainCardId) : null;
  const pillar = main?.pillar ?? "heart";
  const theme = getPosterTheme(pillar);
  const subs = (input.subCardIds ?? [])
    .map((id) => getCard(id))
    .filter(Boolean);

  // 柱ベースの夜空
  const night = ctx.createLinearGradient(0, 0, width, height);
  night.addColorStop(0, theme.night[0]);
  night.addColorStop(0.35, theme.night[1]);
  night.addColorStop(0.7, theme.night[2]);
  night.addColorStop(1, theme.night[3]);
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, width, height);

  for (const [x, y, r, color] of theme.glows) {
    drawGlow(ctx, x, y, r, color);
  }

  const band = ctx.createLinearGradient(0, 200, width, 1100);
  theme.band.forEach((c, i) => {
    band.addColorStop(i / Math.max(theme.band.length - 1, 1), c);
  });
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, width, height);

  // 白線イラスト（背面・透かし）
  if (input.mainCardId) {
    const art = await loadLineArt(input.mainCardId, pillar);
    if (art) {
      const artSize = 720;
      const ax = (width - artSize) / 2;
      const ay = 160;
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.drawImage(art, ax, ay, artSize, artSize);
      ctx.restore();
    }
  }

  // 外枠
  const frame = ctx.createLinearGradient(80, 80, width - 80, height - 80);
  theme.frame.forEach((c, i) => {
    frame.addColorStop(i / Math.max(theme.frame.length - 1, 1), c);
  });
  ctx.strokeStyle = frame;
  ctx.lineWidth = 6;
  roundRect(ctx, 56, 56, width - 112, height - 112, 42);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  roundRect(ctx, 78, 78, width - 156, height - 156, 34);
  ctx.stroke();

  ctx.fillStyle = theme.title;
  ctx.font = "600 34px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("わたしの価値観", width / 2, 170);

  ctx.fillStyle = theme.name;
  ctx.font = "500 28px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(input.displayName, width / 2, 220);

  ctx.fillStyle = theme.mainLabel;
  ctx.font = "700 120px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  const mainLabel = main?.label ?? "—";
  fitCenterText(ctx, mainLabel, width / 2, 420, width - 200, 120);

  const lineGrad = ctx.createLinearGradient(width / 2 - 100, 0, width / 2 + 100, 0);
  theme.accentLine.forEach((c, i) => {
    lineGrad.addColorStop(i / Math.max(theme.accentLine.length - 1, 1), c);
  });
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, 475);
  ctx.lineTo(width / 2 + 90, 475);
  ctx.stroke();

  ctx.fillStyle = theme.mainCaption;
  ctx.font = "600 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("MAIN VALUE", width / 2, 525);

  const subY = 620;
  const boxW = 360;
  const gap = 40;
  const startX = (width - (boxW * 2 + gap)) / 2;

  subs.slice(0, 2).forEach((sub, i) => {
    const x = startX + i * (boxW + gap);
    ctx.fillStyle = "rgba(12, 14, 28, 0.45)";
    roundRect(ctx, x, subY, boxW, 140, 24);
    ctx.fill();
    ctx.fillStyle = theme.subFill[i] ?? theme.subFill[0];
    roundRect(ctx, x, subY, boxW, 140, 24);
    ctx.fill();
    ctx.strokeStyle = theme.subStroke[i] ?? theme.subStroke[0];
    ctx.lineWidth = 2;
    roundRect(ctx, x, subY, boxW, 140, 24);
    ctx.stroke();

    ctx.fillStyle = "#dce6ff";
    ctx.font = "600 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    ctx.fillText("SUB", x + boxW / 2, subY + 42);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 48px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    fitCenterText(ctx, sub?.label ?? "—", x + boxW / 2, subY + 100, boxW - 40, 48);
  });

  const reason = (input.reason ?? "").trim() || "（理由未入力）";
  ctx.fillStyle = "rgba(10, 12, 28, 0.55)";
  roundRect(ctx, 120, 820, width - 240, 280, 28);
  ctx.fill();
  ctx.strokeStyle = theme.reasonStroke;
  ctx.lineWidth = 2;
  roundRect(ctx, 120, 820, width - 240, 280, 28);
  ctx.stroke();

  ctx.fillStyle = theme.reasonTitle;
  ctx.font = "700 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("なぜ、これを大切にするのか", width / 2, 870);

  ctx.fillStyle = "#eef2ff";
  ctx.font = "500 32px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  const lines = wrapText(ctx, reason, width - 320);
  const startReasonY = 930;
  lines.slice(0, 5).forEach((line, i) => {
    ctx.fillText(line, width / 2, startReasonY + i * 44);
  });

  ctx.fillStyle = theme.footer;
  ctx.font = "500 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  const date = new Date().toLocaleDateString("ja-JP");
  ctx.fillText(`価値観ババ抜き ／ ${date}`, width / 2, 1280);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("画像の保存に失敗しました"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `価値観_${input.displayName}_${mainLabel}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  const g = ctx.createRadialGradient(x, y, 10, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

function fitCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number,
  baseSize: number,
) {
  let size = baseSize;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  while (size > 36) {
    ctx.font = `700 ${size}px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  ctx.fillText(text, cx, cy);
}
