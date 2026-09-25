import { useId } from "react";

// Полоса пиксельных кирпичиков LEGO в цветах Roboklocki (RoboKlocki —
// робототехника на LEGO). Пара к шарфу WKS: в лобби нижняя полоса наполовину
// шарф, наполовину кирпичики — и они встречаются ровно под подписью
// "WKS Śląsk Wrocław × Roboklocki".
//
// Рисуется SVG-узором из прямоугольников (crispEdges), а не картинкой:
// кирпич 64px с двумя шипами, рамка чернилами, блик сверху и тень снизу —
// тот же объём, что у кнопок игры. Высота 34px: корпус 28px стоит вровень
// с шарфом и его верхней чернильной линией, шипы торчат над ним.
const BRICK = 64;
const HEIGHT = 34;
const BODY_TOP = 6;
const STUDS = [11, 39];

const COLORS = [
  { face: "var(--color-robo-navy)", hi: "var(--color-robo-navy-hi)", shade: "var(--color-robo-navy-shade)" },
  { face: "var(--color-robo-red)", hi: "var(--color-robo-red-hi)", shade: "var(--color-robo-red-shade)" },
];

export default function BrickStripe({ className = "" }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg className={className} height={HEIGHT} width="100%" shapeRendering="crispEdges" aria-hidden="true">
      <defs>
        <pattern id={`bricks-${id}`} width={BRICK * COLORS.length} height={HEIGHT} patternUnits="userSpaceOnUse">
          {COLORS.map((color, i) => {
            const x = i * BRICK;
            return (
              <g key={i}>
                {STUDS.map((sx) => (
                  <g key={sx}>
                    <rect x={x + sx} y={0} width={18} height={BODY_TOP + 3} fill="var(--color-ink)" />
                    <rect x={x + sx + 3} y={3} width={12} height={BODY_TOP} fill={color.face} />
                    <rect x={x + sx + 3} y={3} width={12} height={2} fill={color.hi} />
                  </g>
                ))}
                <rect x={x} y={BODY_TOP} width={BRICK} height={HEIGHT - BODY_TOP} fill="var(--color-ink)" />
                <rect x={x + 3} y={BODY_TOP + 3} width={BRICK - 3} height={HEIGHT - BODY_TOP - 3} fill={color.face} />
                <rect x={x + 3} y={BODY_TOP + 3} width={BRICK - 3} height={3} fill={color.hi} />
                <rect x={x + 3} y={HEIGHT - 5} width={BRICK - 3} height={5} fill={color.shade} />
              </g>
            );
          })}
        </pattern>
      </defs>
      <rect width="100%" height={HEIGHT} fill={`url(#bricks-${id})`} />
    </svg>
  );
}
