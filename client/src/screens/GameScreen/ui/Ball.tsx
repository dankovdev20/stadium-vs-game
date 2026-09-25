import { motion } from "motion/react";
import gameBall from "../../../assets/GameBall.png";
import type { RoundResolvedPayload } from "../../../game/types";
import { STRIKER_SPOT } from "../model/zoneLayout";
import { buildBallChoreography, BALL_TIMES } from "../model/reveal";

interface BallProps {
  /** Результат раунда; передаётся только в фазе ROUND_RESULT. */
  result: RoundResolvedPayload | null;
}

const IDLE_POS = { x: STRIKER_SPOT.x + 4, y: STRIKER_SPOT.y - 6 };

// Полёт мяча — единая хореография из model/reveal.ts (5 опорных точек:
// старт → старт-хелд → апекс → точка касания → точка успокоения), больше
// не "точка А в точку Б за 1 секунду". Три полупрозрачных "эха" позади
// мяча — дешёвая имитация motion blur: те же кейфреймы, с задержкой и
// уменьшающейся непрозрачностью, никакого canvas/шейдеров не нужно.
//
// key={result?.round} на корневом узле — намеренно: гарантирует свежий
// маунт под каждый новый result (та же причина, что и у
// .animate-character-enter — см. index.css), а не переиспользование
// инстанса с новым `animate`, из-за которого хвост анимации предыдущего
// раунда мог долетать поверх нового.
export default function Ball({ result }: BallProps) {
  if (!result) {
    return (
      <div className="absolute z-[4] h-[10.4cqh] w-[10.4cqh] min-h-8 min-w-8 -translate-x-1/2 -translate-y-1/2" style={{ left: `${IDLE_POS.x}%`, top: `${IDLE_POS.y}%` }} aria-hidden="true">
        <img src={gameBall} alt="" className="block h-full w-full object-contain" />
      </div>
    );
  }

  const choreography = buildBallChoreography(result);
  const { points, durationSec, presentation } = choreography;
  const left = points.map((p) => `${p.x}%`);
  const top = points.map((p) => `${p.y}%`);
  // 6 значений — по одному на опорную точку (start, start, apex, contact, contact-hold, settle).
  const rotate = [0, 0, 300, 560, 560, 620];
  const scale = [1, 1, 1, 0.82, 0.82, 1];
  // Мяч растворяется в конце любого исхода, кроме сейва (там его держит/отбивает
  // вратарь и он остаётся на поле до конца раунда): гол — в сетке, штанга и
  // "над перекладиной" — после отскока от рамы ворот.
  const fades = presentation.ball !== "deflected";
  const opacity = fades ? [1, 1, 1, 1, 1, 0] : [1, 1, 1, 1, 1, 1];
  // 5 значений — по одному на отрезок МЕЖДУ точками: держит-замах / дуга вверх
  // / дуга вниз-до-касания / хит-стоп-заморозка / успокоение.
  const easings: Array<"easeOut" | "easeIn" | "linear" | "easeInOut"> = ["linear", "easeOut", "easeIn", "linear", "easeOut"];

  return (
    <div key={result.round} aria-hidden="true">
      {[0.09, 0.055, 0.03].map((echoOpacityScale, i) => (
        <motion.img
          key={i}
          src={gameBall}
          alt=""
          className="absolute z-[4] h-[10.4cqh] w-[10.4cqh] min-h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 object-contain blur-[2px]"
          initial={{ left: left[0], top: top[0], opacity: 0 }}
          animate={{ left, top, opacity: opacity.map((o) => o * echoOpacityScale) }}
          transition={{ duration: durationSec, times: BALL_TIMES, ease: easings, delay: 0.03 + i * 0.035 }}
        />
      ))}

      <motion.div
        className="absolute z-[5] h-[10.4cqh] w-[10.4cqh] min-h-8 min-w-8 -translate-x-1/2 -translate-y-1/2"
        initial={{ left: left[0], top: top[0] }}
        animate={{ left, top }}
        transition={{ duration: durationSec, times: BALL_TIMES, ease: easings }}
      >
        <motion.img
          src={gameBall}
          alt=""
          className="block h-full w-full object-contain"
          initial={{ rotate: 0, scale: 1, opacity: 1 }}
          animate={{ rotate, scale, opacity }}
          transition={{ duration: durationSec, times: BALL_TIMES, ease: easings }}
        />
      </motion.div>
    </div>
  );
}
