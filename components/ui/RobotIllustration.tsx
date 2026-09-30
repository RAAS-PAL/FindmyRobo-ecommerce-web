import type { RobotVariant } from "@/data/products";

/**
 * Stylized product illustrations — pure SVG, no external assets.
 * Robot body types (LUBA mower, LUBA Mini, pool cleaner) plus two service
 * marks (installation, demo) used by the "services" category products.
 */
export default function RobotIllustration({
  variant,
  className,
}: {
  variant: RobotVariant;
  className?: string;
}) {
  if (variant === "install") {
    return (
      <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Installation service illustration">
        <ellipse cx="100" cy="126" rx="56" ry="7" fill="#000" opacity="0.14" />
        {/* squared card */}
        <rect x="48" y="24" width="104" height="92" rx="10" fill="#f5f6f7" stroke="#1b1c20" strokeWidth="2" />
        {/* gold cog ring */}
        <circle
          cx="100"
          cy="70"
          r="28"
          fill="none"
          style={{ stroke: "var(--color-accent)" }}
          strokeWidth="6"
          strokeDasharray="5.5 7.2"
          strokeLinecap="round"
        />
        {/* wrench */}
        <g transform="rotate(-40 100 70)">
          <rect x="94" y="50" width="12" height="38" rx="4" fill="#1b1c20" />
          <path d="M100 42 a12 12 0 0 0 -11 16 l11 5 11 -5 a12 12 0 0 0 -11 -16 Z" fill="#1b1c20" />
          <circle cx="100" cy="52" r="4.5" fill="#f5f6f7" />
        </g>
        {/* gold bolt accents */}
        <circle cx="68" cy="50" r="3" style={{ fill: "var(--color-accent)" }} />
        <circle cx="132" cy="92" r="3" style={{ fill: "var(--color-accent)" }} />
      </svg>
    );
  }

  if (variant === "demo") {
    return (
      <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Book a demo illustration">
        <ellipse cx="100" cy="126" rx="56" ry="7" fill="#000" opacity="0.14" />
        {/* squared monitor */}
        <rect x="44" y="26" width="112" height="74" rx="9" fill="#f5f6f7" stroke="#1b1c20" strokeWidth="2" />
        <rect x="52" y="34" width="96" height="58" rx="4" fill="#1b1c20" />
        {/* gold play button */}
        <circle cx="100" cy="63" r="18" style={{ fill: "var(--color-accent)" }} />
        <path d="M95 55 L112 63 L95 71 Z" fill="#1b1c20" />
        {/* stand */}
        <rect x="92" y="100" width="16" height="8" rx="2" fill="#1b1c20" />
        <rect x="74" y="107" width="52" height="6" rx="3" fill="#1b1c20" opacity="0.65" />
        {/* gold status dot */}
        <circle cx="134" cy="42" r="3.5" style={{ fill: "var(--color-accent)" }} />
      </svg>
    );
  }

  if (variant === "pool") {
    return (
      <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Robot pool cleaner illustration">
        <ellipse cx="100" cy="122" rx="62" ry="8" fill="#123b28" opacity="0.12" />
        {/* body */}
        <path d="M40 96 Q40 58 100 54 Q160 58 160 96 Q160 108 148 108 L52 108 Q40 108 40 96Z" fill="#123b28" />
        <path d="M48 92 Q50 66 100 62 Q150 66 152 92 Q152 100 144 100 L56 100 Q48 100 48 92Z" fill="#fdfdf8" />
        {/* viewport dome */}
        <ellipse cx="100" cy="66" rx="26" ry="12" fill="#1a5c3e" />
        <ellipse cx="100" cy="64" rx="18" ry="8" fill="#9ec9ae" opacity="0.55" />
        {/* gold trim */}
        <rect x="52" y="82" width="96" height="4" rx="2" style={{ fill: "var(--color-accent)" }} />
        {/* side fins */}
        <path d="M36 98 L20 106 Q16 108 20 110 L40 108Z" style={{ fill: "var(--color-accent)" }} />
        <path d="M164 98 L180 106 Q184 108 180 110 L160 108Z" style={{ fill: "var(--color-accent)" }} />
        {/* tracks */}
        <rect x="54" y="104" width="38" height="12" rx="6" fill="#0b2e1f" />
        <rect x="108" y="104" width="38" height="12" rx="6" fill="#0b2e1f" />
        {/* bubbles */}
        <circle cx="66" cy="40" r="4" fill="#9ec9ae" opacity="0.5" />
        <circle cx="140" cy="32" r="3" fill="#9ec9ae" opacity="0.4" />
        <circle cx="122" cy="44" r="2.5" fill="#9ec9ae" opacity="0.45" />
        {/* status light */}
        <circle cx="100" cy="78" r="3.5" style={{ fill: "var(--color-accent)" }} />
      </svg>
    );
  }

  const mini = variant === "mini";
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Robot lawn mower illustration">
      <ellipse cx="100" cy="124" rx={mini ? 54 : 68} ry="8" fill="#123b28" opacity="0.12" />
      {/* chassis */}
      <path
        d={
          mini
            ? "M52 100 L58 76 Q60 68 70 66 L130 66 Q140 68 142 76 L148 100 Q148 106 140 106 L60 106 Q52 106 52 100Z"
            : "M40 100 L48 70 Q51 60 62 58 L138 58 Q149 60 152 70 L160 100 Q160 106 152 106 L48 106 Q40 106 40 100Z"
        }
        fill="#123b28"
      />
      {/* body shell */}
      <path
        d={
          mini
            ? "M60 92 L66 76 Q68 71 74 70 L126 70 Q132 71 134 76 L140 92 Q140 97 134 97 L66 97 Q60 97 60 92Z"
            : "M50 92 L58 71 Q60 65 68 64 L132 64 Q140 65 142 71 L150 92 Q150 98 143 98 L57 98 Q50 98 50 92Z"
        }
        fill="#fdfdf8"
      />
      {/* gold bumper stripe */}
      <rect x={mini ? 62 : 52} y={mini ? 88 : 87} width={mini ? 76 : 96} height="5" rx="2.5" style={{ fill: "var(--color-accent)" }} />
      {/* sensor dome */}
      <rect x={mini ? 88 : 86} y={mini ? 52 : 42} width={mini ? 24 : 28} height="16" rx="7" fill="#0b2e1f" />
      <circle cx="100" cy={mini ? 52 : 42} r="4" style={{ fill: "var(--color-accent)" }} />
      <rect x={mini ? 96 : 96} y={mini ? 58 : 48} width="8" height="3" rx="1.5" fill="#9ec9ae" opacity="0.7" />
      {/* headlight */}
      <circle cx={mini ? 134 : 146} cy={mini ? 80 : 76} r="3.5" fill="#ffe08a" />
      {/* wheels */}
      <g>
        <circle cx={mini ? 72 : 66} cy="106" r={mini ? 15 : 19} fill="#0b2e1f" />
        <circle cx={mini ? 72 : 66} cy="106" r={mini ? 8 : 10} fill="#1a5c3e" />
        <circle cx={mini ? 72 : 66} cy="106" r="3" style={{ fill: "var(--color-accent)" }} />
      </g>
      <g>
        <circle cx={mini ? 128 : 136} cy="106" r={mini ? 15 : 19} fill="#0b2e1f" />
        <circle cx={mini ? 128 : 136} cy="106" r={mini ? 8 : 10} fill="#1a5c3e" />
        <circle cx={mini ? 128 : 136} cy="106" r="3" style={{ fill: "var(--color-accent)" }} />
      </g>
      {/* wheel treads */}
      <circle cx={mini ? 72 : 66} cy="106" r={mini ? 12 : 15} fill="none" stroke="#fdfdf8" strokeWidth="2" strokeDasharray="4 5" />
      <circle cx={mini ? 128 : 136} cy="106" r={mini ? 12 : 15} fill="none" stroke="#fdfdf8" strokeWidth="2" strokeDasharray="4 5" />
    </svg>
  );
}
