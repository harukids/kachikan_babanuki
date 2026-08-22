import {
  WALLPAPER_PATTERNS,
  type WallpaperPatternId,
} from "@/lib/line-art-wallpapers";

const CACHE = "20260822k";
const ASPECT_W = 9;
const ASPECT_H = 16;

type LineArtCoverBgProps = {
  denser?: boolean;
  pattern?: WallpaperPatternId;
  /** page: 全画面 fixed / preview: 親要素いっぱいに absolute */
  mode?: "page" | "preview";
};

export function LineArtCoverBg({
  denser = false,
  pattern = "scatter",
  mode = "page",
}: LineArtCoverBgProps) {
  const boost = denser ? 1.15 : 1;
  const placements = WALLPAPER_PATTERNS[pattern].placements;

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
        {placements.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${p.id}-${i}`}
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
