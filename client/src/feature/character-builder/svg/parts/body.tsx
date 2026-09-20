import type { ReactElement } from "react";
import { Highlight, Shadow, type PartProps } from "../shared";

// Торс-футболка с мягко изогнутыми руками (кожа — общий skinFill, рукава
// поверх — "accent"), а не робо-плитами. "primary" — основной цвет
// джерси, "accent" — цвет рукавов/отделки.
function BodyBase({ fills, skinFill }: PartProps) {
  return (
    <>
      {/* Руки — открытая кожа от короткого рукава до кисти */}
      <path
        d="M 48 106 Q 32 120 36 146 Q 38 162 52 172 L 60 165 Q 50 154 48 140 Q 46 122 58 110 Z"
        fill={skinFill}
        stroke={fills.metal}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 152 106 Q 168 120 164 146 Q 162 162 148 172 L 140 165 Q 150 154 152 140 Q 154 122 142 110 Z"
        fill={skinFill}
        stroke={fills.metal}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="53" cy="171" r="8.5" fill={skinFill} stroke={fills.metal} strokeWidth="1.6" />
      <circle cx="147" cy="171" r="8.5" fill={skinFill} stroke={fills.metal} strokeWidth="1.6" />

      {/* Торс-джерси */}
      <rect x="58" y="92" width="84" height="86" rx="22" fill={fills.primary} stroke={fills.metal} strokeWidth="3" />
      <path d="M 86 90 Q 100 102 114 90" fill="none" stroke={fills.metal} strokeWidth="2.4" opacity="0.55" />

      {/* Короткие рукава поверх кожи рук */}
      <path
        d="M 46 102 Q 64 90 70 108 Q 63 124 44 124 Q 36 112 46 102 Z"
        fill={fills.accent}
        stroke={fills.metal}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M 154 102 Q 136 90 130 108 Q 137 124 156 124 Q 164 112 154 102 Z"
        fill={fills.accent}
        stroke={fills.metal}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <Highlight cx={78} cy={110} rx={20} ry={14} rotate={-12} />
      <Shadow cx={122} cy={168} rx={22} ry={18} />
    </>
  );
}

// Круглый нашивной значок-эмблема на груди.
function Badge({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <BodyBase fills={fills} skinFill={skinFill} />
      <circle cx="100" cy="134" r="17" fill={fills.accent} stroke={fills.metal} strokeWidth="2" />
      <circle cx="100" cy="134" r="10.5" fill="#ffffff" opacity="0.92" />
      <path d="M 100 126 L 104.5 133 L 95.5 133 Z" fill={fills.accent} />
    </>
  );
}

// Диагональная перевязь через грудь.
function Sash({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <BodyBase fills={fills} skinFill={skinFill} />
      <path d="M 66 178 L 130 96 L 142 104 L 78 186 Z" fill={fills.accent} opacity="0.92" />
    </>
  );
}

// Капитанская повязка на рукаве + отделка воротника.
function Armband({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <BodyBase fills={fills} skinFill={skinFill} />
      <rect x="42" y="128" width="16" height="10" rx="3" fill={fills.accent} stroke={fills.metal} strokeWidth="1.4" transform="rotate(-18 50 133)" />
      <path d="M 82 94 Q 100 106 118 94" fill="none" stroke={fills.accent} strokeWidth="3" opacity="0.85" />
    </>
  );
}

// Манишка (тренировочный жилет) поверх джерси.
function Vest({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <BodyBase fills={fills} skinFill={skinFill} />
      <path d="M 66 100 L 134 100 L 128 176 Q 100 186 72 176 Z" fill={fills.accent} opacity="0.9" stroke={fills.metal} strokeWidth="2" strokeLinejoin="round" />
      <rect x="70" y="92" width="9" height="16" rx="3" fill={fills.accent} stroke={fills.metal} strokeWidth="1.5" />
      <rect x="121" y="92" width="9" height="16" rx="3" fill={fills.accent} stroke={fills.metal} strokeWidth="1.5" />
    </>
  );
}

// Звезда на груди.
function Star({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <BodyBase fills={fills} skinFill={skinFill} />
      <path
        d="M 100 114 L 106 128 L 121 129 L 109 138 L 113 153 L 100 144 L 87 153 L 91 138 L 79 129 L 94 128 Z"
        fill={fills.accent}
        stroke={fills.metal}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </>
  );
}

// Вратарская форма: мягкие наплечники и защитная вставка на груди.
function Keeper({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <BodyBase fills={fills} skinFill={skinFill} />
      <circle cx="62" cy="104" r="11" fill={fills.accent} stroke={fills.metal} strokeWidth="2" />
      <circle cx="138" cy="104" r="11" fill={fills.accent} stroke={fills.metal} strokeWidth="2" />
      <rect x="76" y="118" width="48" height="30" rx="12" fill={fills.accent} opacity="0.85" stroke={fills.metal} strokeWidth="1.6" />
    </>
  );
}

export const BODY_VARIANTS: Record<string, (props: PartProps) => ReactElement> = {
  badge: Badge,
  sash: Sash,
  armband: Armband,
  vest: Vest,
  star: Star,
  keeper: Keeper,
};
