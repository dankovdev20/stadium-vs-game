import type { ReactElement } from "react";
import { Highlight, Shadow, type PartFills, type PartProps } from "../shared";

// Шорты (общий пояс на обеих ногах) + гольфы — без бёдер-цилиндров и
// коленных шарниров: одежда сразу закрывает ногу целиком, кожа не видна.
// "primary" — цвет шорт, "accent" — цвет гольфов/окантовки бутс.
function LegsBase({ fills }: { fills: PartFills }) {
  return (
    <>
      {/*
        Пояс шорт начинается на y=176, а не на y=200: подол торса (см.
        BodyBase в ../body.tsx) — скруглённый прямоугольник с нижним краем
        ~178 по центру (и выше по краям из-за rx=22), а у варианта "Vest"
        нашивной клапан доходит до 186. При y=200 между подолом и поясом
        оставалась пустая полоса — на маленьком спрайте конструктора
        незаметная, но на полноэкранной арене матча (CharacterSprite
        size="lg"/"sm", разрешение киоска 1920×1080) читалась как разрыв
        тела персонажа пополам. Пояс красится ПОД торсом (legs монтируется
        первым в PlayerCharacter.tsx, торс поверх), так что нахлёст просто
        скрывается за подолом, а не торчит поверх него.
      */}
      <rect x="70" y="176" width="60" height="54" rx="15" fill={fills.primary} stroke={fills.metal} strokeWidth="3" />
      <rect x="70" y="222" width="27" height="26" rx="10" fill={fills.primary} stroke={fills.metal} strokeWidth="3" />
      <rect x="103" y="222" width="27" height="26" rx="10" fill={fills.primary} stroke={fills.metal} strokeWidth="3" />
      <rect x="71" y="246" width="25" height="38" rx="10" fill={fills.accent} stroke={fills.metal} strokeWidth="2.5" />
      <rect x="104" y="246" width="25" height="38" rx="10" fill={fills.accent} stroke={fills.metal} strokeWidth="2.5" />
      <Highlight cx={80} cy={230} rx={9} ry={16} rotate={-8} opacity={0.22} />
      <Shadow cx={122} cy={272} rx={10} ry={16} opacity={0.16} />
    </>
  );
}

function Boot({ cx, fill }: { cx: number; fill: string }) {
  return <rect x={cx - 16} y={280} width={32} height={17} rx={8.5} fill={fill} />;
}

// Классические бутсы со шнуровкой.
function Cleats({ fills }: PartProps): ReactElement {
  return (
    <>
      <LegsBase fills={fills} />
      <Boot cx={83.5} fill={fills.metal} />
      <Boot cx={116.5} fill={fills.metal} />
      <path d="M 76 284 L 91 284 M 79 289 L 88 289" stroke="#ffffff" strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
      <path d="M 109 284 L 124 284 M 112 289 L 121 289" stroke="#ffffff" strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
    </>
  );
}

// Кроссовки-ракеты с игровым огоньком из пятки.
function RocketShoes({ fills }: PartProps): ReactElement {
  return (
    <>
      <LegsBase fills={fills} />
      <Boot cx={83.5} fill={fills.metal} />
      <Boot cx={116.5} fill={fills.metal} />
      <path d="M 74 296 Q 83 304 92 296 Q 83 314 74 296 Z" fill={fills.accent} opacity="0.9" />
      <path d="M 107 296 Q 116 304 125 296 Q 116 314 107 296 Z" fill={fills.accent} opacity="0.9" />
    </>
  );
}

// Ролики.
function RollerSkates({ fills }: PartProps): ReactElement {
  return (
    <>
      <LegsBase fills={fills} />
      <rect x="68" y="280" width="31" height="12" rx="6" fill={fills.metal} />
      <rect x="101" y="280" width="31" height="12" rx="6" fill={fills.metal} />
      <circle cx="78" cy="297" r="6" fill={fills.accent} stroke={fills.metal} strokeWidth="1.4" />
      <circle cx="92" cy="297" r="6" fill={fills.accent} stroke={fills.metal} strokeWidth="1.4" />
      <circle cx="111" cy="297" r="6" fill={fills.accent} stroke={fills.metal} strokeWidth="1.4" />
      <circle cx="125" cy="297" r="6" fill={fills.accent} stroke={fills.metal} strokeWidth="1.4" />
    </>
  );
}

// Пружинки-прыгунки.
function SpringShoes({ fills }: PartProps): ReactElement {
  return (
    <>
      <rect x="70" y="200" width="60" height="30" rx="15" fill={fills.primary} stroke={fills.metal} strokeWidth="3" />
      <rect x="70" y="222" width="27" height="18" rx="9" fill={fills.primary} stroke={fills.metal} strokeWidth="3" />
      <rect x="103" y="222" width="27" height="18" rx="9" fill={fills.primary} stroke={fills.metal} strokeWidth="3" />
      <path d="M 72 240 Q 96 248 72 256 Q 96 264 83.5 274" fill="none" stroke={fills.accent} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 105 240 Q 129 248 105 256 Q 129 264 116.5 274" fill="none" stroke={fills.accent} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <Boot cx={83.5} fill={fills.metal} />
      <Boot cx={116.5} fill={fills.metal} />
    </>
  );
}

// Высокие кроссовки с боковым "плавником".
function HighTops({ fills }: PartProps): ReactElement {
  return (
    <>
      <LegsBase fills={fills} />
      <rect x={83.5 - 15} y={272} width={30} height={26} rx={9} fill={fills.metal} />
      <rect x={116.5 - 15} y={272} width={30} height={26} rx={9} fill={fills.metal} />
      <path d="M 70 288 Q 84 280 96 288 Q 84 292 70 288 Z" fill={fills.accent} />
      <path d="M 103 288 Q 117 280 129 288 Q 117 292 103 288 Z" fill={fills.accent} />
    </>
  );
}

// Турбо-бутсы с "поршнями" вдоль гольфа.
function TurboBoots({ fills }: PartProps): ReactElement {
  return (
    <>
      <LegsBase fills={fills} />
      <line x1="76" y1="250" x2="76" y2="278" stroke={fills.accent} strokeWidth="4" strokeLinecap="round" />
      <line x1="90" y1="250" x2="90" y2="278" stroke={fills.accent} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <line x1="110" y1="250" x2="110" y2="278" stroke={fills.accent} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <line x1="124" y1="250" x2="124" y2="278" stroke={fills.accent} strokeWidth="4" strokeLinecap="round" />
      <Boot cx={83.5} fill={fills.metal} />
      <Boot cx={116.5} fill={fills.metal} />
    </>
  );
}

export const LEGS_VARIANTS: Record<string, (props: PartProps) => ReactElement> = {
  cleats: Cleats,
  rocket: RocketShoes,
  rollers: RollerSkates,
  springs: SpringShoes,
  hightops: HighTops,
  turbo: TurboBoots,
};
