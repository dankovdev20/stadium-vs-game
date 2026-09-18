import { motion } from "motion/react";
import football from "../../../assets/football.png";
import type { RoundResolvedPayload } from "../../../game/types";
import { ZONES, ZONE_POINT, type ZoneId } from "../model/zones";
import { getOutcomePresentation } from "../model/outcomes";
import ZoneButton, { type ZoneRole } from "./ZoneButton";

export interface PenaltySceneProps {
  isStriker: boolean;
  /** Выбор ЛОКАЛЬНОГО игрока в текущем раунде — чужой выбор здесь не появляется */
  myZone: ZoneId | null;
  /** Серверный результат; передаётся только в фазе ROUND_RESULT */
  result: RoundResolvedPayload | null;
  zoneRole: ZoneRole;
  hasChosen: boolean;
  onSelectZone: (zone: ZoneId) => void;
}

/** Рамка ворот внутри сцены, в процентах */
const GOAL = { left: 53, top: 8, width: 42, height: 48 };

const toScene = (gx: number, gy: number) => ({
  x: GOAL.left + (gx * GOAL.width) / 100,
  y: GOAL.top + (gy * GOAL.height) / 100,
});

const BALL_START = { x: 24, y: 80 };
const KEEPER_HOME = toScene(50, 86);

const zoneButtonPosition = (zone: ZoneId) => {
  const point = toScene(ZONE_POINT[zone].x, ZONE_POINT[zone].y);
  const rightSideDrop = zone === 3 || zone === 5 ? 8 : 0;
  return { left: `${point.x}%`, top: `${point.y + rightSideDrop}%` };
};

const FIELD_LINES = [
  "polygon(5% 100%, 6% 100%, 112% -8%, 111.4% -8%)",
  "polygon(29% 100%, 30% 100%, 112% -8%, 111.4% -8%)",
  "polygon(53% 100%, 54% 100%, 112% -8%, 111.4% -8%)",
  "polygon(77% 100%, 78% 100%, 112% -8%, 111.4% -8%)",
];

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
    case "post": {
      if (point.x < 50) return toScene(-4, 8);
      if (point.x > 50) return toScene(104, 8);
      return toScene(50, -6);
    }
    case "over":
    default:
      return toScene(50, -22);
  }
}

function keeperTarget(result: RoundResolvedPayload) {
  const presentation = getOutcomePresentation(result.result.outcome);
  if (presentation.keeper === "watch") return KEEPER_HOME;

  const zone = result.keeperZone as ZoneId;
  const point = ZONE_POINT[zone] ?? ZONE_POINT[2];
  const isTop = point.y < 50;
  return toScene(point.x, isTop ? 52 : 72);
}

export default function PenaltyScene({ isStriker, myZone, result, zoneRole, hasChosen, onSelectZone }: PenaltySceneProps) {
  const resultKey = result ? `${result.round}-${result.result.outcome}` : null;

  const presentation = result ? getOutcomePresentation(result.result.outcome) : null;
  const ballPos = result ? ballTarget(result) : BALL_START;
  const keeperPos = result ? keeperTarget(result) : KEEPER_HOME;

  const strikerZone = result ? (result.strikerZone as ZoneId) : null;
  const keeperZone = result ? (result.keeperZone as ZoneId) : null;

  return (
    <motion.div
      key={resultKey ?? "playing"}
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1, x: presentation?.sceneEffect === "save" || presentation?.sceneEffect === "miss" ? [0, -8, 8, 0] : 0 }}
      transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 }, x: { duration: 0.32, ease: "easeOut" } }}
      className="relative min-h-0 flex-1 overflow-hidden"
      data-testid="penalty-scene"
    >
      <div className="absolute inset-x-0 top-0 bottom-[34%] bg-[linear-gradient(180deg,#0a1c34_0%,#14365e_100%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-[4%] flex h-[14%] justify-center gap-[0.6%] opacity-55" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <motion.span key={i} animate={{ y: [0, "-14%", 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: i % 3 === 0 ? 0.7 : i % 2 === 0 ? 0.35 : 0 }} className="h-full w-[1.6%] bg-[repeating-linear-gradient(180deg,#3b5f8f_0_22%,#22405f_22%_50%,#4d78ad_50%_74%,#1b3350_74%_100%)]" />
        ))}
      </div>
      <div className="absolute inset-0 bg-[#0f6836]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[#12793f] [clip-path:polygon(0_42%,100%_10%,100%_100%,0_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-35" aria-hidden="true">
        {FIELD_LINES.map((clipPath) => <span key={clipPath} className="absolute inset-0 bg-white" style={{ clipPath }} />)}
      </div>

      {/* Ворота с пятью визуальными мишенями */}
      <div
        className="absolute origin-bottom-left transform-[skewY(6deg)]"
        style={{
          left: `${GOAL.left}%`,
          top: `${GOAL.top}%`,
          width: `${GOAL.width}%`,
          height: `${GOAL.height}%`,
        }}
        aria-hidden="true"
      >
        <motion.div animate={presentation?.sceneEffect === "goal" ? { backgroundColor: ["rgba(3,12,24,0.55)", "rgba(255,214,10,0.45)", "rgba(3,12,24,0.55)"] } : { backgroundColor: "rgba(3,12,24,0.55)" }} transition={{ duration: 0.62, repeat: presentation?.sceneEffect === "goal" ? 1 : 0 }} className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.28)_2px,transparent_2px)] [background-size:6.5%_11%]" />
        <div className="absolute inset-[2%_-2%_0_2%] -skew-y-1 bg-black/20 shadow-[0_12px_18px_rgba(0,0,0,0.35)]" />
        <div className="absolute inset-0 shadow-[inset_0_0_0_clamp(6px,0.7vw,14px)_#f4f6fb]" />
        <div className="absolute -left-[1.5%] top-0 h-full w-[3%] bg-[#f4f6fb] shadow-[3px_0_0_#9ca3af,0_0_10px_rgba(0,0,0,0.35)]" />
        <div className="absolute -right-[1.5%] top-0 h-full w-[3%] bg-[#f4f6fb] shadow-[-3px_0_0_#9ca3af,0_0_10px_rgba(0,0,0,0.35)]" />
        <div className="absolute -left-[1.5%] -top-[1.5%] h-[4%] w-[103%] bg-[#ffffff] shadow-[0_3px_0_#9ca3af,0_0_10px_rgba(0,0,0,0.35)]" />
        <div className="absolute -bottom-[1.5%] left-0 h-[3%] w-full bg-[#d1d5db] shadow-[0_3px_0_#9ca3af]" />

        {ZONES.map((zone) => {
          const point = ZONE_POINT[zone.id];
          const mine = myZone === zone.id;
          const isStrikerZone = strikerZone === zone.id;
          const isKeeperZone = keeperZone === zone.id;

          return (
            <div
              key={zone.id}
              className={[
                "absolute flex h-[38%] w-[30%] -translate-x-1/2 -translate-y-1/2 items-center justify-center border-[3px] border-dashed border-white/20 text-center transition-colors duration-150",
                mine ? `border-solid ${isStriker ? "border-[#ff6b6b] bg-[rgba(224,35,42,0.42)]" : "border-[#67a0ff] bg-[rgba(37,84,232,0.42)]"}` : "",
                isStrikerZone ? "border-solid border-[#ff6b6b] bg-[rgba(224,35,42,0.5)]" : "",
                isKeeperZone ? "shadow-[inset_0_0_0_4px_#67a0ff]" : "",
                isStrikerZone && isKeeperZone ? "bg-[rgba(124,58,237,0.5)]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          );
        })}
      </div>

      {!result && (
        <div className="absolute inset-0 z-[6]" role="group" aria-label={isStriker ? "Wybierz miejsce strzału" : "Wybierz miejsce obrony"}>
          {ZONES.map((zone) => (
            <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={zoneButtonPosition(zone.id)}>
              <ZoneButton
                zone={zone.id}
                label={zone.name}
                points={zone.points}
                role={zoneRole}
                selected={myZone === zone.id}
                disabled={hasChosen}
                onClick={onSelectZone}
                floating
              />
            </div>
          ))}
        </div>
      )}

      {/* Вратарь ЗАГЛУШКА*/}
      <motion.div
        initial={{ left: `${KEEPER_HOME.x}%`, top: `${KEEPER_HOME.y}%`, rotate: 0, opacity: 1 }}
        animate={{ left: `${keeperPos.x}%`, top: `${keeperPos.y}%`, rotate: result?.result.outcome === "OBRONA_PERFEKCYJNA" ? -12 : presentation?.keeper === "fingertip" ? -22 : presentation?.keeper === "leg" ? -6 : presentation?.keeper === "beaten" ? 16 : 0, opacity: presentation?.keeper === "beaten" ? 0.85 : 1 }}
        transition={{ duration: 0.52, ease: [0.22, 0.85, 0.3, 1] }}
        className="absolute z-[2] h-[clamp(80px,11vh,170px)] w-[clamp(44px,5vw,92px)] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        {!isStriker && (
          <motion.div animate={{ y: [-5, 0, -5] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-52%] left-1/2 flex h-[clamp(42px,4.5vw,68px)] w-[clamp(32px,3.5vw,52px)] -translate-x-1/2 items-center justify-center border-2 border-slate-400 bg-white font-['Baloo_2'] text-[clamp(0.65rem,1.1vw,1rem)] font-bold uppercase tracking-[0.1em] text-black drop-shadow-[0_3px_0_#4b5563,0_0_6px_rgba(0,0,0,0.65)] [clip-path:polygon(50%_0,92%_50%,50%_100%,8%_50%)]">
            <span className="relative z-10">TY</span>
          </motion.div>
        )}
        <span className="absolute left-[20%] top-[22%] h-[60%] w-[80%] bg-[#2554e8] shadow-[0_0_0_3px_#04070d]" />        
      </motion.div>

      {/* Мяч */}
      <motion.div
        initial={{ left: `${BALL_START.x}%`, top: `${BALL_START.y}%`, width: "clamp(28px,3.6vw,64px)", height: "clamp(28px,3.6vw,64px)" }}
        animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, width: result ? "clamp(20px,2.6vw,44px)" : "clamp(28px,3.6vw,64px)", height: result ? "clamp(20px,2.6vw,44px)" : "clamp(28px,3.6vw,64px)" }}
        transition={{ duration: 0.6, ease: [0.25, 0.7, 0.35, 1] }}
        className="absolute z-[4] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <motion.img
          src={football}
          alt=""
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.42, repeat: Infinity, ease: "linear" }}
          className="block h-full w-full object-contain"
        />
      </motion.div>

      {/* Бьющий ЗАГЛУШКА*/}
      <motion.div
        animate={result ? { x: [-0, -2, 0], y: [0, -2, 0], rotate: [0, -9, -3] } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 0.52, ease: "easeOut" }}
        className="absolute left-[22%] top-[78%] z-[3] h-[clamp(150px,24vh,290px)] w-[clamp(80px,10vw,150px)] -translate-x-1/2 -translate-y-1/2 origin-[50%_100%]"
        aria-hidden="true"
      >
        {isStriker && (
          <motion.div animate={{ y: [-5, 0, -5] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-34%] left-1/2 flex h-[clamp(42px,4.5vw,68px)] w-[clamp(32px,3.5vw,52px)] -translate-x-1/2 items-center justify-center border-2 border-slate-400 bg-white font-['Baloo_2'] text-[clamp(0.65rem,1.1vw,1rem)] font-bold uppercase tracking-[0.1em] text-black drop-shadow-[0_3px_0_#4b5563,0_0_6px_rgba(0,0,0,0.65)] [clip-path:polygon(50%_0,92%_50%,50%_100%,8%_50%)]">
            <span className="relative z-10">TY</span>
          </motion.div>
        )}
        <span className="absolute left-[20%] top-[22%] h-[40%] w-[60%] bg-[#7f1010] shadow-[0_0_0_3px_#04070d]" />
      </motion.div>

      {result && presentation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[5] flex items-center justify-center bg-black/25 px-4"
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.72, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.2, 1.4, 0.4, 1] }}
            className="w-full max-w-[min(92vw,38rem)] overflow-hidden rounded-2xl border-2 border-gray-200 bg-white text-center shadow-[0_8px_0_rgba(23,37,84,0.25),0_18px_40px_rgba(0,0,0,0.3)]"
            role="status"
            data-testid="result-banner"
          >
            <div className={`h-3 ${result.result.isGoal ? "bg-green-500" : presentation.sceneEffect === "save" ? "bg-blue-500" : "bg-gray-400"}`} />
            <div className="flex flex-col items-center gap-2 px-6 py-5 sm:px-10 sm:py-7">
              <span className={`font-['Anton'] text-[clamp(2rem,5vw,4.5rem)] leading-none tracking-wide ${result.result.isGoal ? "text-green-900" : "text-blue-950"}`}>{presentation.title}</span>
              <span className="font-['Baloo_2'] text-[clamp(0.9rem,1.4vw,1.35rem)] font-semibold text-gray-700">
                {result.result.details || presentation.fallbackDetails}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
