type Placement = {
  id: string;
  top: string;
  size: number;
  rotate: number;
  opacity: number;
  left?: string;
  right?: string;
};

/** トップ／ロビー用の薄い線画散らし（位置は固定で毎回同じ） */
const PLACEMENTS: Placement[] = [
  { id: "heart-01", top: "6%", left: "-2%", size: 150, rotate: -22, opacity: 0.11 },
  { id: "work-08", top: "4%", right: "-4%", size: 130, rotate: 16, opacity: 0.1 },
  { id: "growth-10", top: "28%", left: "-6%", size: 110, rotate: 28, opacity: 0.09 },
  { id: "heart-17", top: "22%", right: "-3%", size: 145, rotate: -12, opacity: 0.1 },
  { id: "growth-08", top: "48%", left: "2%", size: 95, rotate: -35, opacity: 0.08 },
  { id: "work-13", top: "52%", right: "1%", size: 120, rotate: 24, opacity: 0.09 },
  { id: "heart-03", top: "72%", left: "-4%", size: 140, rotate: 14, opacity: 0.1 },
  { id: "growth-06", top: "70%", right: "-5%", size: 155, rotate: -20, opacity: 0.1 },
  { id: "work-19", top: "88%", left: "18%", size: 100, rotate: 8, opacity: 0.08 },
  { id: "heart-13", top: "86%", right: "14%", size: 115, rotate: -28, opacity: 0.09 },
];

type LineArtScatterProps = {
  /** 少し濃くする（ロビーなど） */
  denser?: boolean;
};

export function LineArtScatter({ denser = false }: LineArtScatterProps) {
  const boost = denser ? 1.25 : 1;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {PLACEMENTS.map((p) => (
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
            width: p.size,
            height: p.size,
            opacity: p.opacity * boost,
            transform: `rotate(${p.rotate}deg)`,
          }}
          draggable={false}
        />
      ))}
    </div>
  );
}
