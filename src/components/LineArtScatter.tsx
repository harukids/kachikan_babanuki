type Placement = {
  id: string;
  top: string;
  size: number;
  rotate: number;
  opacity: number;
  left?: string;
  right?: string;
};

/** トップ／ロビー用の線画散らし（位置は固定で毎回同じ） */
const PLACEMENTS: Placement[] = [
  { id: "heart-01", top: "5%", left: "-2%", size: 200, rotate: -22, opacity: 0.38 },
  { id: "work-08", top: "3%", right: "-4%", size: 180, rotate: 16, opacity: 0.34 },
  { id: "growth-10", top: "26%", left: "-5%", size: 160, rotate: 28, opacity: 0.32 },
  { id: "heart-17", top: "20%", right: "-3%", size: 190, rotate: -12, opacity: 0.36 },
  { id: "growth-08", top: "46%", left: "1%", size: 140, rotate: -35, opacity: 0.28 },
  { id: "work-13", top: "50%", right: "0%", size: 170, rotate: 24, opacity: 0.3 },
  { id: "heart-03", top: "70%", left: "-4%", size: 185, rotate: 14, opacity: 0.34 },
  { id: "growth-06", top: "68%", right: "-5%", size: 200, rotate: -20, opacity: 0.34 },
  { id: "work-19", top: "86%", left: "16%", size: 145, rotate: 8, opacity: 0.28 },
  { id: "heart-13", top: "84%", right: "12%", size: 160, rotate: -28, opacity: 0.3 },
];

type LineArtScatterProps = {
  denser?: boolean;
};

export function LineArtScatter({ denser = false }: LineArtScatterProps) {
  const boost = denser ? 1.15 : 1;
  return (
    <div
      aria-hidden
      data-bg-art
      className="pointer-events-none inset-0 overflow-hidden"
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
            opacity: Math.min(0.55, p.opacity * boost),
            transform: `rotate(${p.rotate}deg)`,
          }}
          draggable={false}
        />
      ))}
    </div>
  );
}
