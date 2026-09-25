// Пиксельные иконки на сетке ~10×10 — вместо гладких векторов lucide, чтобы
// иконки жили в том же пикселе, что арт стадиона. Каждая буква сетки — цвет:
//   o, k — currentColor (контур/пятна, наследуют цвет текста)
//   w — белый, b/B — лазурь, y/d/h — золото, l — сиреневый (неактивное)
// Точка — прозрачно. Прямоугольники склеиваются по строкам, shape-rendering
// crispEdges — никакого сглаживания на границах "пикселей".
const ICONS = {
  ball: [
    "...oooooo...",
    "..owwwwwwo..",
    ".owwwkkwwwo.",
    "owwwkkkkwwwo",
    "okwwkkkkwwko",
    "okkwwkkwwkko",
    "owkwwwwwwkwo",
    "owwwwwwwwwwo",
    "owwkwwwwkwwo",
    ".owkkwwkkwo.",
    "..owwkkwwo..",
    "...oooooo...",
  ],
  glove: ["..o.o.o...", ".owowowo..", ".owowowo..", ".owowowooo", ".owwwwwowo", ".owwwwwwwo", ".owwwwwwo.", "..owwwwo..", "..oBBBBo..", "..oooooo.."],
  trophy: [".oooooooooo.", "oyoyhyyyyoyo", "oyoyhyyyyoyo", ".oyyhyyyyyo.", "..oyyyyyyo..", "...oyyyyo...", "....oyyo....", ".....oo.....", "....oyyo....", "...oyyyyo...", "..oddddddo..", "..oooooooo.."],
  lock: ["..ooooo..", ".oo...oo.", ".o.....o.", ".o.....o.", "ooooooooo", "olllllllo", "olllolllo", "olllolllo", "olllllllo", "ooooooooo"],
  check: [".......o", "......oo", "o....oo.", "oo..oo..", ".oooo...", "..oo...."],
  arrow: ["o....", "oo...", "ooo..", "oooo.", "ooooo", "oooo.", "ooo..", "oo...", "o...."],
  reload: ["...oooo.o.", ".oo....ooo", "o.....oooo", "o.........", "o.........", "o........o", ".o......o.", "..oo..oo..", "....oo...."],
  dice: ["oooooooooo", "owwwwwwwwo", "owkkwwkkwo", "owkkwwkkwo", "owwwkkwwwo", "owwwkkwwwo", "owkkwwkkwo", "owkkwwkkwo", "owwwwwwwwo", "oooooooooo"],
  plug: ["...o..o...", "...o..o...", ".oooooooo.", ".oyyyyyyo.", ".oyyyyyyo.", "..oyyyyo..", "...oyyo...", "....oo....", "....oo....", "....oo...."],
} as const;

export type PixelIconName = keyof typeof ICONS;

const COLORS: Record<string, string> = {
  o: "currentColor",
  k: "currentColor",
  w: "#ffffff",
  b: "var(--color-azure-300)",
  B: "var(--color-azure-700)",
  y: "var(--color-gold-500)",
  d: "var(--color-gold-700)",
  h: "var(--color-gold-300)",
  l: "var(--color-mute-500)",
};

interface Run {
  x: number;
  y: number;
  w: number;
  fill: string;
}

// Считается один раз на модуль, а не на каждый рендер.
const RUNS: Record<PixelIconName, { w: number; h: number; runs: Run[] }> = Object.fromEntries(
  Object.entries(ICONS).map(([name, rows]) => {
    const runs: Run[] = [];
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (ch === ".") {
          x += 1;
          continue;
        }
        let end = x;
        while (end < row.length && row[end] === ch) end += 1;
        runs.push({ x, y, w: end - x, fill: COLORS[ch] });
        x = end;
      }
    });
    return [name, { w: Math.max(...rows.map((r) => r.length)), h: rows.length, runs }];
  }),
) as Record<PixelIconName, { w: number; h: number; runs: Run[] }>;

interface PixelIconProps {
  name: PixelIconName;
  /** Размер одного "пикселя" иконки в px. */
  scale?: number;
  className?: string;
}

export default function PixelIcon({ name, scale = 4, className = "" }: PixelIconProps) {
  const { w, h, runs } = RUNS[name];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={`block shrink-0 ${className}`}
      aria-hidden="true"
    >
      {runs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}
