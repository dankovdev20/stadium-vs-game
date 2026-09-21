import { motion } from "motion/react";
import football from "../../../assets/football.svg";
import type { RoundResolvedPayload } from "../../../game/types";
import { ZONE_POINT, GOAL_LANDMARKS, STRIKER_SPOT, type ZoneId } from "../model/zoneLayout";
import { getOutcomePresentation } from "../model/outcomes";

// "Готовая к удару" позиция мяча на арене — у ноги нападающего (чуть правее
// и ниже центра STRIKER_SPOT, там же, где на арте нарисована его стопа).
const BALL_START = { x: STRIKER_SPOT.x + 5, y: STRIKER_SPOT.y + 24 };

function ballTarget(result: RoundResolvedPayload) {
  const zone = result.strikerZone as ZoneId;
  const point = ZONE_POINT[zone] ?? ZONE_POINT[2];
  const presentation = getOutcomePresentation(result.result.outcome);
  const { postLeft, postRight, crossbarCenter, overBar } = GOAL_LANDMARKS;

  switch (presentation.ball) {
    case "zone":
      return point;
    case "deflected": {
      const outward = point.x < 63 ? -12 : point.x > 63 ? 12 : 10;
      return { x: point.x + outward, y: Math.max(20, point.y - 9) };
    }
    case "post":
      if (point.x < 63) return postLeft;
      if (point.x > 63) return postRight;
      return crossbarCenter;
    case "over":
    default:
      return overBar;
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
      initial={{ left: `${BALL_START.x}%`, top: `${BALL_START.y}%` }}
      animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
      transition={{ duration: result ? 1.05 : 0, ease: [0.32, 0.1, 0.28, 1] }}
      className="absolute z-[4] h-[9cqh] w-[9cqh] min-h-8 min-w-8 -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    >
      {/*
        Мяч не крутится, пока лежит у ноги — вращение включается ТОЛЬКО на
        время полёта (result появляется в фазе ROUND_RESULT) и заметно
        медленнее, чем было (было 0.42с/оборот — почти невидимый блин;
        теперь ~2 неполных оборота за весь полёт, направление читается).
      */}
      <motion.img
        src={football}
        alt=""
        animate={result ? { rotate: 620, scale: [1, 0.72] } : { rotate: 0, scale: 1 }}
        transition={{ duration: result ? 1.05 : 0.2, ease: result ? [0.32, 0.1, 0.28, 1] : "easeOut" }}
        className="block h-full w-full object-contain"
      />
    </motion.div>
  );
}
