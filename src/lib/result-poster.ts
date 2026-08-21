import { getCard } from "@/lib/deck";

export type PosterInput = {
  displayName: string;
  mainCardId: string | null;
  subCardIds: string[];
  reason: string | null;
};

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

  // 夜空ベース
  const night = ctx.createLinearGradient(0, 0, width, height);
  night.addColorStop(0, "#0b1020");
  night.addColorStop(0.35, "#161b3d");
  night.addColorStop(0.7, "#241433");
  night.addColorStop(1, "#101528");
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, width, height);

  // オーロラ（青→紫→ピンク→オレンジ→黄）
  drawGlow(ctx, 160, 220, 520, "rgba(110,168,255,0.55)");
  drawGlow(ctx, 860, 180, 480, "rgba(183,148,255,0.5)");
  drawGlow(ctx, 780, 780, 520, "rgba(255,142,200,0.45)");
  drawGlow(ctx, 220, 980, 460, "rgba(255,176,134,0.38)");
  drawGlow(ctx, 540, 560, 360, "rgba(255,226,138,0.22)");

  // 斜めのオーロラ帯
  const band = ctx.createLinearGradient(0, 200, width, 1100);
  band.addColorStop(0, "rgba(110,168,255,0.0)");
  band.addColorStop(0.2, "rgba(110,168,255,0.18)");
  band.addColorStop(0.4, "rgba(183,148,255,0.2)");
  band.addColorStop(0.6, "rgba(255,142,200,0.18)");
  band.addColorStop(0.8, "rgba(255,176,134,0.14)");
  band.addColorStop(1, "rgba(255,226,138,0.0)");
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, width, height);

  // 外枠（ネオン）
  const frame = ctx.createLinearGradient(80, 80, width - 80, height - 80);
  frame.addColorStop(0, "rgba(110,168,255,0.85)");
  frame.addColorStop(0.35, "rgba(183,148,255,0.85)");
  frame.addColorStop(0.65, "rgba(255,142,200,0.85)");
  frame.addColorStop(1, "rgba(255,176,134,0.85)");
  ctx.strokeStyle = frame;
  ctx.lineWidth = 6;
  roundRect(ctx, 56, 56, width - 112, height - 112, 42);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  roundRect(ctx, 78, 78, width - 156, height - 156, 34);
  ctx.stroke();

  const main = input.mainCardId ? getCard(input.mainCardId) : null;
  const subs = (input.subCardIds ?? [])
    .map((id) => getCard(id))
    .filter(Boolean);

  ctx.fillStyle = "#c9d7ff";
  ctx.font = "600 34px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("わたしの価値観", width / 2, 170);

  ctx.fillStyle = "#f4f7ff";
  ctx.font = "500 28px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(input.displayName, width / 2, 220);

  // メイン
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 120px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  const mainLabel = main?.label ?? "—";
  fitCenterText(ctx, mainLabel, width / 2, 420, width - 200, 120);

  const lineGrad = ctx.createLinearGradient(width / 2 - 100, 0, width / 2 + 100, 0);
  lineGrad.addColorStop(0, "#6ea8ff");
  lineGrad.addColorStop(0.5, "#ff8ec8");
  lineGrad.addColorStop(1, "#ffb086");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, 475);
  ctx.lineTo(width / 2 + 90, 475);
  ctx.stroke();

  ctx.fillStyle = "#ff9ad5";
  ctx.font = "600 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("MAIN VALUE", width / 2, 525);

  // サブ
  const subY = 620;
  const boxW = 360;
  const gap = 40;
  const startX = (width - (boxW * 2 + gap)) / 2;
  const subColors = [
    ["rgba(110,168,255,0.22)", "rgba(110,168,255,0.7)"],
    ["rgba(255,142,200,0.22)", "rgba(255,142,200,0.7)"],
  ] as const;

  subs.slice(0, 2).forEach((sub, i) => {
    const x = startX + i * (boxW + gap);
    ctx.fillStyle = "rgba(12, 14, 28, 0.45)";
    roundRect(ctx, x, subY, boxW, 140, 24);
    ctx.fill();
    ctx.fillStyle = subColors[i][0];
    roundRect(ctx, x, subY, boxW, 140, 24);
    ctx.fill();
    ctx.strokeStyle = subColors[i][1];
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

  // 理由カード
  const reason = (input.reason ?? "").trim() || "（理由未入力）";
  ctx.fillStyle = "rgba(10, 12, 28, 0.55)";
  roundRect(ctx, 120, 820, width - 240, 280, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,226,138,0.35)";
  ctx.lineWidth = 2;
  roundRect(ctx, 120, 820, width - 240, 280, 28);
  ctx.stroke();

  ctx.fillStyle = "#ffe28a";
  ctx.font = "700 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("なぜ、これを大切にするのか", width / 2, 870);

  ctx.fillStyle = "#eef2ff";
  ctx.font = "500 32px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  const lines = wrapText(ctx, reason, width - 320);
  const startReasonY = 930;
  lines.slice(0, 5).forEach((line, i) => {
    ctx.fillText(line, width / 2, startReasonY + i * 44);
  });

  ctx.fillStyle = "#9aa8c7";
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
