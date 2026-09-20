import type { ReactElement } from "react";
import { Highlight, Shadow, type PartProps } from "../shared";

// Тёплый карий цвет радужки — фиксированный, не завязан на палитру опции:
// раньше глаза красились в fills.accent, и на бандане с красным акцентом
// зрачки получались тревожно-алыми вместо милых. Один приятный оттенок
// одинаково хорошо смотрится под любой причёской.
const EYE_COLOR = "#7a4a2a";

// Круглая человеческая голова (не робо-череп): большие милые глаза с
// бликом-искоркой, румянец, брови и лёгкая улыбка. "primary" здесь —
// цвет волос (виден прядями/пучком там, где не закрыт аксессуаром),
// "accent" — цвет самого аксессуара (бандана/кепка/лента/корона); кожа
// берётся из общего skinFill.
function HeadBase({ fills, skinFill }: PartProps) {
  return (
    <>
      {/* Шея — мостик между головой и воротом футболки (та часть тела рисуется
          после торса, поэтому перекрывает его верхний край и прячет стык). */}
      <rect x="88" y="66" width="24" height="30" rx="8" fill={skinFill} stroke={fills.metal} strokeWidth="2" />
      <rect x="58" y="46" width="10" height="15" rx="5" fill={skinFill} stroke={fills.metal} strokeWidth="2" />
      <rect x="132" y="46" width="10" height="15" rx="5" fill={skinFill} stroke={fills.metal} strokeWidth="2" />
      <rect x="64" y="14" width="72" height="64" rx="30" fill={skinFill} stroke={fills.metal} strokeWidth="3" />

      {/* Брови */}
      <path d="M 76 38 Q 84 33 92 37" fill="none" stroke={fills.metal} strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
      <path d="M 108 37 Q 116 33 124 38" fill="none" stroke={fills.metal} strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />

      {/* Большие милые глаза */}
      <circle cx="84" cy="52" r="11" fill="#fbfaf7" stroke={fills.metal} strokeWidth="1.5" />
      <circle cx="116" cy="52" r="11" fill="#fbfaf7" stroke={fills.metal} strokeWidth="1.5" />
      <circle cx="85" cy="53" r="6.4" fill={EYE_COLOR} />
      <circle cx="115" cy="53" r="6.4" fill={EYE_COLOR} />
      <circle cx="85" cy="53" r="2.8" fill="#20130a" />
      <circle cx="115" cy="53" r="2.8" fill="#20130a" />
      <circle cx="87.5" cy="50" r="1.8" fill="#ffffff" opacity="0.95" />
      <circle cx="117.5" cy="50" r="1.8" fill="#ffffff" opacity="0.95" />

      {/* Румянец */}
      <ellipse cx="70" cy="65" rx="7.5" ry="4.5" fill="#ff9d84" opacity="0.4" />
      <ellipse cx="130" cy="65" rx="7.5" ry="4.5" fill="#ff9d84" opacity="0.4" />

      {/* Носик и улыбка */}
      <path d="M 98 60 Q 100 64 102 60" fill="none" stroke={fills.metal} strokeWidth="1.6" opacity="0.4" strokeLinecap="round" />
      <path d="M 85 71 Q 100 80 115 71" fill="none" stroke="#7a3b32" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />

      <Highlight cx={83} cy={30} rx={17} ry={10} rotate={-16} />
      <Shadow cx={119} cy={64} rx={16} ry={11} />
    </>
  );
}

// Спортивная повязка-бандана: ровная лента толстым штрихом по дуге (не
// заливка между двумя кривыми — так толщина ленты остаётся одинаковой
// по всей длине) + узелок сбоку и пара выбивающихся прядей волос сверху.
function Bandana({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <HeadBase fills={fills} skinFill={skinFill} />
      <path d="M 62 38 Q 100 22 138 38" fill="none" stroke={fills.accent} strokeWidth="13" strokeLinecap="round" />
      <path d="M 130 34 L 146 28 L 140 42 Z" fill={fills.accent} stroke={fills.metal} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M 72 22 Q 68 10 78 14" fill="none" stroke={fills.primary} strokeWidth="4" strokeLinecap="round" />
      <path d="M 92 18 Q 90 6 100 10" fill="none" stroke={fills.primary} strokeWidth="4" strokeLinecap="round" />
      <Highlight cx={88} cy={32} rx={20} ry={4} rotate={-6} opacity={0.22} />
    </>
  );
}

// Бейсболка козырьком вперёд + пряди волос, выбивающиеся по бокам.
function Cap({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <HeadBase fills={fills} skinFill={skinFill} />
      <path d="M 66 26 Q 64 12 76 16" fill="none" stroke={fills.primary} strokeWidth="5" strokeLinecap="round" />
      <path d="M 134 26 Q 136 12 124 16" fill="none" stroke={fills.primary} strokeWidth="5" strokeLinecap="round" />
      <path d="M 64 34 Q 100 4 136 34 L 136 42 Q 100 18 64 42 Z" fill={fills.accent} stroke={fills.metal} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="100" cy="10" rx="4" ry="3" fill={fills.metal} opacity="0.7" />
      <path d="M 64 38 Q 44 40 40 50 Q 56 48 66 42 Z" fill={fills.accent} stroke={fills.metal} strokeWidth="2.5" strokeLinejoin="round" />
      <Highlight cx={92} cy={18} rx={18} ry={7} rotate={-8} opacity={0.22} />
    </>
  );
}

// Кудрявый пушистый хохолок из нескольких кружков.
function Curls({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <HeadBase fills={fills} skinFill={skinFill} />
      <circle cx="75" cy="24" r="12" fill={fills.primary} stroke={fills.metal} strokeWidth="1.6" />
      <circle cx="100" cy="16" r="13.5" fill={fills.primary} stroke={fills.metal} strokeWidth="1.6" />
      <circle cx="125" cy="24" r="12" fill={fills.primary} stroke={fills.metal} strokeWidth="1.6" />
      <circle cx="88" cy="15" r="9.5" fill={fills.primary} opacity="0.95" />
      <circle cx="112" cy="15" r="9.5" fill={fills.primary} opacity="0.95" />
      <circle cx="72" cy="20" r="3.5" fill="#ffffff" opacity="0.3" />
      <circle cx="97" cy="12" r="3.5" fill="#ffffff" opacity="0.3" />
      <path d="M 96 8 Q 100 4 104 8" fill="none" stroke={fills.accent} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    </>
  );
}

// Высокий хвостик сбоку с резинкой-лентой.
function Ponytail({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <HeadBase fills={fills} skinFill={skinFill} />
      <path
        d="M 64 42 Q 66 14 100 12 Q 134 14 136 42 Q 134 26 100 24 Q 66 26 64 42 Z"
        fill={fills.primary}
        stroke={fills.metal}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="144" cy="36" rx="10" ry="15" fill={fills.primary} stroke={fills.metal} strokeWidth="1.6" transform="rotate(24 144 36)" />
      <rect x="135" y="29" width="7" height="7" rx="3.5" fill={fills.accent} />
      <Highlight cx={90} cy={20} rx={16} ry={5} rotate={-8} opacity={0.2} />
    </>
  );
}

// Мягкий округлый ирокез вместо острого — модная стрижка, а не "шип".
function Mohawk({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <HeadBase fills={fills} skinFill={skinFill} />
      <path
        d="M 100 0 C 114 0 120 18 111 30 L 89 30 C 80 18 86 0 100 0 Z"
        fill={fills.primary}
        stroke={fills.metal}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M 90 28 Q 100 22 110 28" fill="none" stroke={fills.metal} strokeWidth="1.6" opacity="0.35" />
      <ellipse cx="98" cy="10" rx="5" ry="10" fill="#ffffff" opacity="0.28" />
    </>
  );
}

// Тиара с шариками на кончиках + пара прядей волос снизу.
function Crown({ fills, skinFill }: PartProps): ReactElement {
  return (
    <>
      <HeadBase fills={fills} skinFill={skinFill} />
      <path d="M 68 30 Q 72 22 78 26" stroke={fills.primary} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M 132 30 Q 128 22 122 26" stroke={fills.primary} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
      <path
        d="M 76 26 L 79 12 L 88 24 L 100 8 L 112 24 L 121 12 L 124 26 Z"
        fill={fills.accent}
        stroke={fills.metal}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="79" cy="10" r="3" fill={fills.accent} stroke={fills.metal} strokeWidth="1.3" />
      <circle cx="100" cy="6" r="3.5" fill={fills.accent} stroke={fills.metal} strokeWidth="1.3" />
      <circle cx="121" cy="10" r="3" fill={fills.accent} stroke={fills.metal} strokeWidth="1.3" />
      <circle cx="100" cy="16" r="2.4" fill="#ffffff" opacity="0.8" />
    </>
  );
}

// Карта варианта -> геометрии. PlayerCharacter и PartTilePreview используют
// одну и ту же карту, поэтому превью-карточка в гардеробе и манекен на
// подиуме всегда рисуют один и тот же арт.
export const HEAD_VARIANTS: Record<string, (props: PartProps) => ReactElement> = {
  bandana: Bandana,
  cap: Cap,
  curls: Curls,
  ponytail: Ponytail,
  mohawk: Mohawk,
  crown: Crown,
};
