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
        <ellipse cx="100" cy="126" rx="58" ry="8" fill="#123b28" opacity="0.12" />
        {/* rounded tool badge */}
        <rect x="42" y="24" width="116" height="92" rx="22" fill="#123b28" />
        <rect x="50" y="32" width="100" height="76" rx="16" fill="#fdfdf8" />
        {/* wrench head + handle (diagonal) */}
        <g transform="rotate(-38 100 70)">
          <rect x="93" y="44" width="14" height="42" rx="5" fill="#1a5c3e" />
          <path d="M100 36 a13 13 0 0 0 -12 18 l12 6 12 -6 a13 13 0 0 0 -12 -18 Z" fill="#1a5c3e" />
          <circle cx="100" cy="46" r="5" fill="#fdfdf8" />
          <rect x="94" y="82" width="12" height="8" rx="3" fill="#0b2e1f" />
        </g>
        {/* gold screwdriver crossing */}
        <g transform="rotate(40 100 74)">
          <rect x="96" y="42" width="8" height="34" rx="3" fill="#f5c842" />
          <rect x="97.5" y="74" width="5" height="14" rx="2.5" fill="#0b2e1f" />
        </g>
        {/* gold bolt accents */}
        <circle cx="66" cy="52" r="3.5" fill="#f5c842" />
        <circle cx="134" cy="90" r="3.5" fill="#f5c842" />
      </svg>
    );
  }

  if (variant === "demo") {
    return (
      <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Demo booking illustration">
        <ellipse cx="100" cy="126" rx="58" ry="8" fill="#123b28" opacity="0.12" />
        {/* screen */}
        <rect x="40" y="26" width="120" height="82" rx="16" fill="#123b28" />
        <rect x="48" y="34" width="104" height="66" rx="10" fill="#fdfdf8" />
        {/* play button */}
        <circle cx="100" cy="67" r="22" fill="#1a5c3e" />
        <path d="M93 57 L114 67 L93 77 Z" fill="#fdfdf8" />
        <circle cx="100" cy="67" r="22" fill="none" stroke="#f5c842" strokeWidth="3" />
        {/* stand */}
        <rect x="92" y="106" width="16" height="9" rx="2" fill="#123b28" />
        <rect x="76" y="114" width="48" height="6" rx="3" fill="#1a5c3e" />
        {/* live dot + signal */}
        <circle cx="132" cy="44" r="4" fill="#f5c842" />
        <path d="M60 44 h14" stroke="#f5c842" strokeWidth="3" strokeLinecap="round" />
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
        <rect x="52" y="82" width="96" height="4" rx="2" fill="#f5c842" />
        {/* side fins */}
        <path d="M36 98 L20 106 Q16 108 20 110 L40 108Z" fill="#f5c842" />
        <path d="M164 98 L180 106 Q184 108 180 110 L160 108Z" fill="#f5c842" />
        {/* tracks */}
        <rect x="54" y="104" width="38" height="12" rx="6" fill="#0b2e1f" />
        <rect x="108" y="104" width="38" height="12" rx="6" fill="#0b2e1f" />
        {/* bubbles */}
        <circle cx="66" cy="40" r="4" fill="#9ec9ae" opacity="0.5" />
        <circle cx="140" cy="32" r="3" fill="#9ec9ae" opacity="0.4" />
        <circle cx="122" cy="44" r="2.5" fill="#9ec9ae" opacity="0.45" />
        {/* status light */}
        <circle cx="100" cy="78" r="3.5" fill="#f5c842" />
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
      <rect x={mini ? 62 : 52} y={mini ? 88 : 87} width={mini ? 76 : 96} height="5" rx="2.5" fill="#f5c842" />
      {/* sensor dome */}
      <rect x={mini ? 88 : 86} y={mini ? 52 : 42} width={mini ? 24 : 28} height="16" rx="7" fill="#0b2e1f" />
      <circle cx="100" cy={mini ? 52 : 42} r="4" fill="#f5c842" />
      <rect x={mini ? 96 : 96} y={mini ? 58 : 48} width="8" height="3" rx="1.5" fill="#9ec9ae" opacity="0.7" />
      {/* headlight */}
      <circle cx={mini ? 134 : 146} cy={mini ? 80 : 76} r="3.5" fill="#ffe08a" />
      {/* wheels */}
      <g>
        <circle cx={mini ? 72 : 66} cy="106" r={mini ? 15 : 19} fill="#0b2e1f" />
        <circle cx={mini ? 72 : 66} cy="106" r={mini ? 8 : 10} fill="#1a5c3e" />
        <circle cx={mini ? 72 : 66} cy="106" r="3" fill="#f5c842" />
      </g>
      <g>
        <circle cx={mini ? 128 : 136} cy="106" r={mini ? 15 : 19} fill="#0b2e1f" />
        <circle cx={mini ? 128 : 136} cy="106" r={mini ? 8 : 10} fill="#1a5c3e" />
        <circle cx={mini ? 128 : 136} cy="106" r="3" fill="#f5c842" />
      </g>
      {/* wheel treads */}
      <circle cx={mini ? 72 : 66} cy="106" r={mini ? 12 : 15} fill="none" stroke="#fdfdf8" strokeWidth="2" strokeDasharray="4 5" />
      <circle cx={mini ? 128 : 136} cy="106" r={mini ? 12 : 15} fill="none" stroke="#fdfdf8" strokeWidth="2" strokeDasharray="4 5" />
    </svg>
  );
}
