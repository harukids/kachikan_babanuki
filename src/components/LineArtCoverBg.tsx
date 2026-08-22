type Placement = {
  id: string;
  /** 構図キャンバス内の位置（%） */
  x: number;
  y: number;
  /** キャンバス幅に対するサイズ（%） */
  size: number;
  rotate: number;
  opacity: number;
};

/**
 * 入場系用の線画壁紙。
 * 9:16 の決まった構図を cover で広げる（縦横比が変わっても相対関係は同じ）。
 */
const PLACEMENTS: Placement[] = [
  { id: "heart-01", x: 2, y: 4, size: 28, rotate: -22, opacity: 0.14 },
  { id: "work-08", x: 68, y: 3, size: 26, rotate: 16, opacity: 0.13 },
  { id: "growth-10", x: -2, y: 22, size: 24, rotate: 28, opacity: 0.12 },
  { id: "heart-17", x: 72, y: 18, size: 27, rotate: -12, opacity: 0.14 },
  { id: "growth-08", x: 4, y: 42, size: 22, rotate: -35, opacity: 0.11 },
  { id: "work-13", x: 70, y: 46, size: 25, rotate: 24, opacity: 0.12 },
  { id: "heart-03", x: 0, y: 66, size: 27, rotate: 14, opacity: 0.13 },
  { id: "growth-06", x: 66, y: 64, size: 29, rotate: -20, opacity: 0.13 },
  { id: "work-19", x: 18, y: 84, size: 22, rotate: 8, opacity: 0.11 },
  { id: "heart-13", x: 58, y: 82, size: 24, rotate: -28, opacity: 0.12 },
];

const CACHE = "20260822j";
const ASPECT_W = 9;
const ASPECT_H = 16;

type LineArtCoverBgProps = {
  denser?: boolean;
  /** page: 全画面 fixed / preview: 親要素いっぱいに absolute */
  mode?: "page" | "preview";
};

export function LineArtCoverBg({
  denser = false,
  mode = "page",
}: LineArtCoverBgProps) {
  const boost = denser ? 1.15 : 1;

  return (
    <div
      aria-hidden
      data-bg-art={mode === "page" ? true : undefined}
      className={
        mode === "page"
          ? "pointer-events-none inset-0 overflow-hidden"
          : "pointer-events-none absolute inset-0 overflow-hidden"
      }
    >
      {/*
        cover: aspect を保ったまま min-width/min-height 100% で親を覆い、はみ出しは切る
      */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          aspectRatio: `${ASPECT_W} / ${ASPECT_H}`,
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
        }}
      >
        {PLACEMENTS.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.id}
            src={`/illustrations/v3/${p.id}.svg?v=${CACHE}`}
            alt=""
            className="absolute select-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}%`,
              height: "auto",
              opacity: Math.min(0.22, p.opacity * boost),
              transform: `rotate(${p.rotate}deg)`,
            }}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}
