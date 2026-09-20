// Общая инфраструктура псевдо-3D шейдинга и цвета для частей персонажа:
// каждая часть красится не плоским цветом, а линейным градиентом (светлый
// блик сверху слева -> насыщенный тон -> затемнение снизу справа, через
// color-mix() — поддерживается в Chrome, на котором работают
// стенды-киоски), плюс блики (Highlight) и мягкие тени (Shadow) поверх
// силуэта для ощущения объёма.
export interface PartFills {
  primary: string;
  accent: string;
  metal: string;
}

// Общая сигнатура геометрии части: помимо собственной палитры (fills)
// голове и телу нужна ссылка на градиент кожи (лицо/уши, открытые руки) —
// единая для всего персонажа вне зависимости от того, какая часть её
// использует. Ноги её не используют (шорты сразу переходят в гольфы, кожа
// не видна), но сигнатура остаётся общей для всех трёх категорий.
export interface PartProps {
  fills: PartFills;
  skinFill: string;
}

// Единый тон кожи для всех персонажей (лицо, уши, открытые руки) — не
// завязан на палитру опций: смешивать голову/тело/ноги от разных
// вариантов — это и есть суть "конструктора", а рассинхрон тона кожи
// между независимо выбранными частями выглядел бы небрежно. Один приятный
// тёплый оттенок одинаково хорошо смотрится под любой причёской/формой.
export const SKIN_TONE = "#f2b98a";
export const SKIN_SHADE = "#d99a68";

export function Rivet({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={2.4} fill="#2a2f36" opacity={0.85} />;
}

export function Highlight({
  cx,
  cy,
  rx,
  ry,
  rotate = 0,
  opacity = 0.28,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate?: number;
  opacity?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="#ffffff"
      opacity={opacity}
      transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}
    />
  );
}

export function Shadow({ cx, cy, rx, ry, opacity = 0.16 }: { cx: number; cy: number; rx: number; ry: number; opacity?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000000" opacity={opacity} />;
}

// id должен быть уникальным на весь документ — на игровом поле одновременно
// стоят два игрока (и ещё по карточке на вариант в гардеробе), а id внутри
// <defs> должен быть уникален на весь документ, иначе url(#...) у одного
// инстанса начнёт красить другой.
export function PartGradient({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stopColor={`color-mix(in srgb, ${color} 45%, white)`} />
      <stop offset="55%" stopColor={color} />
      <stop offset="100%" stopColor={`color-mix(in srgb, ${color} 62%, black)`} />
    </linearGradient>
  );
}

// Отдельный градиент для кожи — используется головой/телом напрямую (не
// через палитру опции), поэтому id у него фиксированный per-instance так
// же, как и у обычных PartGradient.
export function SkinGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stopColor={`color-mix(in srgb, ${SKIN_TONE} 55%, white)`} />
      <stop offset="60%" stopColor={SKIN_TONE} />
      <stop offset="100%" stopColor={SKIN_SHADE} />
    </linearGradient>
  );
}
