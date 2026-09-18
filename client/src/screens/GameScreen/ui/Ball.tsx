import { motion } from "motion/react";
import football from "../../../assets/football.svg";
import type { RoundResolvedPayload } from "../../../game/types";
import { toScene, ZONE_POINT, type ZoneId } from "../model/zoneLayout";
import { getOutcomePresentation } from "../model/outcomes";

// "Готовая к удару" позиция мяча на сцене, в процентах.
const BALL_START = { x: 24, y: 80 };

function ballTarget(result: RoundResolvedPayload) {
  const zone = result.strikerZone as ZoneId;
  const point = ZONE_POINT[zone] ?? ZONE_POINT[2];
  const presentation = getOutcomePresentation(result.result.outcome);

  switch (presentation.ball) {
    case "zone":
      return toScene(point.x, point.y);
    case "deflected": {
      const outward = point.x < 50 ? -14 : point.x > 50 ? 14 : 12;
      return toScene(point.x + outward, point.y - 10);
    }
    case "post":
      if (point.x < 50) return toScene(-4, 8);
      if (point.x > 50) return toScene(104, 8);
      return toScene(50, -6);
    case "over":
    default:
      return toScene(50, -22);
  }
}

interface BallProps {
  /** Результат раунда; передаётся только в фазе ROUND_RESULT. */
  result: RoundResolvedPayload | null;
}

// Текстура — client/src/assets/football.svg (классический ч/б узор,
// нарисован сам). Точка замены на фото мяча позже — просто другой import.
export default function Ball({ result }: BallProps) {
  const ballPos = result ? ballTarget(result) : BALL_START;

  return (
    <motion.div
      initial={{ left: `${BALL_START.x}%`, top: `${BALL_START.y}%`, width: "56px", height: "56px" }}
      animate={{
        left: `${ballPos.x}%`,
        top: `${ballPos.y}%`,
        width: result ? "36px" : "56px",
        height: result ? "36px" : "56px",
      }}
      transition={{ duration: 0.6, ease: [0.25, 0.7, 0.35, 1] }}
      className="absolute z-[4] -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    >
      <motion.img
        src={football}
        alt=""
        animate={{ rotate: 360 }}
        transition={{ duration: 0.42, repeat: Infinity, ease: "linear" }}
        className="block h-full w-full object-contain"
      />
    </motion.div>
  );
}
