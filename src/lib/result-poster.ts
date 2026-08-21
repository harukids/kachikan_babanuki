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

  // 背景グラデーション（爽やかなミント→スカイ）
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#e8fbf4");
  bg.addColorStop(0.45, "#f7fffb");
  bg.addColorStop(1, "#e6f3ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // やわらかい光の円
  const glow1 = ctx.createRadialGradient(200, 180, 20, 200, 180, 420);
  glow1.addColorStop(0, "rgba(90, 210, 170, 0.35)");
  glow1.addColorStop(1, "rgba(90, 210, 170, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(900, 1100, 20, 900, 1100, 480);
  glow2.addColorStop(0, "rgba(255, 170, 120, 0.28)");
  glow2.addColorStop(1, "rgba(255, 170, 120, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 外枠
  ctx.strokeStyle = "rgba(45, 140, 120, 0.25)";
  ctx.lineWidth = 8;
  roundRect(ctx, 48, 48, width - 96, height - 96, 40);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 140, 100, 0.35)";
  ctx.lineWidth = 2;
  roundRect(ctx, 72, 72, width - 144, height - 144, 32);
  ctx.stroke();

  const main = input.mainCardId ? getCard(input.mainCardId) : null;
  const subs = (input.subCardIds ?? [])
    .map((id) => getCard(id))
    .filter(Boolean);

  // タイトル
  ctx.fillStyle = "#2a8f78";
  ctx.font = "600 36px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("わたしの価値観", width / 2, 160);

  ctx.fillStyle = "#5a7a72";
  ctx.font = "500 28px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText(input.displayName, width / 2, 210);

  // メイン大表示
  ctx.fillStyle = "#16382f";
  ctx.font = "700 120px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  const mainLabel = main?.label ?? "—";
  fitCenterText(ctx, mainLabel, width / 2, 420, width - 200, 120);

  // メイン下のアクセントライン
  ctx.strokeStyle = "#ff8f6b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, 470);
  ctx.lineTo(width / 2 + 80, 470);
  ctx.stroke();

  ctx.fillStyle = "#2a8f78";
  ctx.font = "600 26px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("MAIN VALUE", width / 2, 520);

  // サブ2つ
  const subY = 620;
  const boxW = 360;
  const gap = 40;
  const startX = (width - (boxW * 2 + gap)) / 2;
  subs.slice(0, 2).forEach((sub, i) => {
    const x = startX + i * (boxW + gap);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    roundRect(ctx, x, subY, boxW, 140, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(42, 143, 120, 0.3)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, subY, boxW, 140, 24);
    ctx.stroke();

    ctx.fillStyle = "#2a8f78";
    ctx.font = "600 22px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    ctx.fillText("SUB", x + boxW / 2, subY + 42);

    ctx.fillStyle = "#16382f";
    ctx.font = "700 48px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
    fitCenterText(ctx, sub?.label ?? "—", x + boxW / 2, subY + 100, boxW - 40, 48);
  });

  // 理由
  const reason = (input.reason ?? "").trim() || "（理由未入力）";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundRect(ctx, 120, 820, width - 240, 280, 28);
  ctx.fill();

  ctx.fillStyle = "#ff8f6b";
  ctx.font = "700 24px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  ctx.fillText("なぜ、これを大切にするのか", width / 2, 870);

  ctx.fillStyle = "#2d4a43";
  ctx.font = "500 32px 'Zen Maru Gothic', 'Hiragino Sans', sans-serif";
  const lines = wrapText(ctx, reason, width - 320);
  const startReasonY = 930;
  lines.slice(0, 5).forEach((line, i) => {
    ctx.fillText(line, width / 2, startReasonY + i * 44);
  });

  // フッタ
  ctx.fillStyle = "#7a9a92";
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
