type Placement = {
  id: string;
  top: string;
  size: number;
  rotate: number;
  opacity: number;
  left?: string;
  right?: string;
};

/** トップ／ロビー用の線画散らし（位置は固定で毎回同じ）※従来方式 */
const PLACEMENTS: Placement[] = [
  { id: "heart-01", top: "5%", left: "-2%", size: 200, rotate: -22, opacity: 0.14 },
  { id: "work-08", top: "3%", right: "-4%", size: 180, rotate: 16, opacity: 0.13 },
  { id: "growth-10", top: "26%", left: "-5%", size: 160, rotate: 28, opacity: 0.12 },
  { id: "heart-17", top: "20%", right: "-3%", size: 190, rotate: -12, opacity: 0.14 },
  { id: "growth-08", top: "46%", left: "1%", size: 140, rotate: -35, opacity: 0.11 },
  { id: "work-13", top: "50%", right: "0%", size: 170, rotate: 24, opacity: 0.12 },
  { id: "heart-03", top: "70%", left: "-4%", size: 185, rotate: 14, opacity: 0.13 },
  { id: "growth-06", top: "68%", right: "-5%", size: 200, rotate: -20, opacity: 0.13 },
  { id: "work-19", top: "86%", left: "16%", size: 145, rotate: 8, opacity: 0.11 },
  { id: "heart-13", top: "84%", right: "12%", size: 160, rotate: -28, opacity: 0.12 },
];

type LineArtScatterProps = {
  denser?: boolean;
  /** page: 全画面 fixed / preview: 親の absolute */
  mode?: "page" | "preview";
};

export function LineArtScatter({
  denser = false,
  mode = "page",
}: LineArtScatterProps) {
  const boost = denser ? 1.1 : 1;
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
      {PLACEMENTS.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id}
          src={`/illustrations/v3/${p.id}.svg?v=20260822e`}
          alt=""
          width={p.size}
          height={p.size}
          className="absolute select-none"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            width: mode === "preview" ? `${(p.size / 390) * 100}%` : p.size,
            height: mode === "preview" ? "auto" : p.size,
            opacity: Math.min(0.22, p.opacity * boost),
            transform: `rotate(${p.rotate}deg)`,
          }}
          draggable={false}
        />
      ))}
    </div>
  );
}
