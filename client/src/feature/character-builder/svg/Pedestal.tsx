interface PedestalProps {
  className?: string;
}

// Подиум в раздевалке — пиксельный круг газона с точкой пенальти (раньше —
// металлический барабан, оставшийся от робота). Рисуется из сетки
// "пикселей" (как PixelIcon): эллипс верхней грани + боковина толщиной
// DEPTH, контур чернилами там, где у клетки есть пустой сосед. Сетка
// считается один раз при загрузке модуля.
const W = 92;
const A = 45.5; // полуось X
const B = 11.5; // полуось Y
const DEPTH = 6; // толщина боковины в клетках
const CX = W / 2; // ровно по центру сетки — иначе эллипс несимметричен на полклетки
const CY = 12;
const H = Math.floor(CY + B + DEPTH + 2);
const CELL = 6;

const COLORS = {
  o: "var(--color-ink)",
  g: "#8ccb72", // газон
  G: "#9bd483", // полоса покоса
  r: "#c3ebad", // блик по верхнему краю
  s: "#62a457", // боковина
  S: "#4e8c4e", // боковина в тени
  w: "#ffffff", // точка пенальти
} as const;

const inTop = (x: number, y: number) => ((x + 0.5 - CX) / A) ** 2 + ((y + 0.5 - CY) / B) ** 2 <= 1;
const inBody = (x: number, y: number) =>
  inTop(x, y) ||
  ((x + 0.5 - CX) / A) ** 2 + ((y + 0.5 - CY - DEPTH) / B) ** 2 <= 1 ||
  (Math.abs(x + 0.5 - CX) <= A && y + 0.5 >= CY && y + 0.5 <= CY + DEPTH);

function cellColor(x: number, y: number): keyof typeof COLORS | null {
  if (!inBody(x, y)) return null;
  const onEdge = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].some(([dx, dy]) => !inBody(x + dx, y + dy));
  if (onEdge) return "o";
  if (!inTop(x, y)) return y < CY + DEPTH + B - 3 ? "s" : "S";
  if (((x + 0.5 - CX) / 4.2) ** 2 + ((y + 0.5 - CY) / 1.3) ** 2 <= 1) return "w";
  if (!inTop(x, y - 1)) return "r";
  return Math.floor(x / 8) % 2 === 0 ? "g" : "G";
}

const RUNS: { x: number; y: number; w: number; fill: string }[] = [];
for (let y = 0; y < H; y++) {
  let x = 0;
  while (x < W) {
    const c = cellColor(x, y);
    if (!c) {
      x++;
      continue;
    }
    let end = x;
    while (end < W && cellColor(end, y) === c) end++;
    RUNS.push({ x, y, w: end - x, fill: COLORS[c] });
    x = end;
  }
}

const PEDESTAL_WIDTH = W * CELL;
const PEDESTAL_HEIGHT = H * CELL;

export default function Pedestal({ className = "" }: PedestalProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={PEDESTAL_WIDTH}
      height={PEDESTAL_HEIGHT}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {RUNS.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}
