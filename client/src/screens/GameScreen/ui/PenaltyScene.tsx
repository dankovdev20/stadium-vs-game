import { motion, AnimatePresence } from "motion/react";
import type { CharacterSelection, RoundResolvedPayload } from "../../../game/types";
import CharacterSprite from "../../../feature/character-builder/ui/CharacterSprite";
import { ZONES, GOAL, zoneButtonPosition, type ZoneId } from "../model/zoneLayout";
import { getOutcomePresentation } from "../model/outcomes";
import Ball from "./Ball";
import ZoneButton, { type ZoneRole } from "./ZoneButton";

export interface PenaltySceneProps {
  strikerCharacter: CharacterSelection;
  keeperCharacter: CharacterSelection;
  /** Роль ЛОКАЛЬНОГО игрока — решает, где рисовать стрелочку "это ты". */
  isStriker: boolean;
  myZone: ZoneId | null;
  result: RoundResolvedPayload | null;
  hasChosen: boolean;
  onSelectZone: (zone: ZoneId) => void;
}

const FIELD_LINES = [
  "polygon(5% 100%, 6% 100%, 112% -8%, 111.4% -8%)",
  "polygon(29% 100%, 30% 100%, 112% -8%, 111.4% -8%)",
  "polygon(53% 100%, 54% 100%, 112% -8%, 111.4% -8%)",
  "polygon(77% 100%, 78% 100%, 112% -8%, 111.4% -8%)",
];

// Маленькая стрелочка над своим персонажем — единственный способ отличить
// "это я" в единой сцене без раздельных камер атаки/защиты.
function YouArrow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: [0, -4, 0] }}
      transition={{ y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
      className="absolute -top-6 left-1/2 -translate-x-1/2"
      aria-hidden="true"
    >
      <svg width="22" height="18" viewBox="0 0 22 18">
        <path d="M11 18 L0 4 L22 4 Z" fill="var(--color-gold-500)" stroke="#04070d" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
}

// Единая сцена: одна и та же камера для обоих игроков. "У ворот" и "у мяча"
// — фиксированные места на экране; какая РОЛЬ там стоит решают
// strikerRole/keeperRole, а не то, кто смотрит — поэтому при смене ролей
// между раундами персонажи визуально меняются местами (см. AnimatePresence
// ниже), а не переключается вся камера.
export default function PenaltyScene({ strikerCharacter, keeperCharacter, isStriker, myZone, result, hasChosen, onSelectZone }: PenaltySceneProps) {
  const presentation = result ? getOutcomePresentation(result.result.outcome) : null;
  const strikerZone = result ? (result.strikerZone as ZoneId) : null;
  const keeperZone = result ? (result.keeperZone as ZoneId) : null;
  const zoneRole: ZoneRole = isStriker ? "striker" : "keeper";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Небо + трибуны */}
      <div className="absolute inset-x-0 top-0 bottom-[34%] bg-[linear-gradient(180deg,#0a1c34_0%,#14365e_100%)]" aria-hidden="true" />
      {/* Поле */}
      <div className="absolute inset-0 bg-[var(--color-grass-700)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[var(--color-grass-500)] [clip-path:polygon(0_42%,100%_10%,100%_100%,0_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        {FIELD_LINES.map((clipPath) => (
          <span key={clipPath} className="absolute inset-0 bg-white" style={{ clipPath }} />
        ))}
      </div>

      {/* Ворота с перекосом — та же рамка и для нападающего, и для вратаря */}
      <div
        className="absolute origin-bottom-left [transform:skewY(6deg)]"
        style={{ left: `${GOAL.left}%`, top: `${GOAL.top}%`, width: `${GOAL.width}%`, height: `${GOAL.height}%` }}
        aria-hidden="true"
      >
        <motion.div
          animate={presentation?.sceneEffect === "goal" ? { backgroundColor: ["rgba(3,12,24,0.55)", "rgba(255,214,10,0.45)", "rgba(3,12,24,0.55)"] } : { backgroundColor: "rgba(3,12,24,0.55)" }}
          transition={{ duration: 0.62, repeat: presentation?.sceneEffect === "goal" ? 1 : 0 }}
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.28)_2px,transparent_2px)] [background-size:6.5%_11%]"
        />
        <div className="absolute -left-[1.5%] top-0 h-full w-[3%] bg-[#f4f6fb] shadow-[3px_0_0_#9ca3af]" />
        <div className="absolute -right-[1.5%] top-0 h-full w-[3%] bg-[#f4f6fb] shadow-[-3px_0_0_#9ca3af]" />
        <div className="absolute -left-[1.5%] -top-[1.5%] h-[4%] w-[103%] bg-white shadow-[0_3px_0_#9ca3af]" />

        {result &&
          ZONES.map((zone) => {
            const point = zoneButtonPosition(zone.id);
            const isStrikerZone = strikerZone === zone.id;
            const isKeeperZone = keeperZone === zone.id;
            if (!isStrikerZone && !isKeeperZone) return null;
            return (
              <div
                key={zone.id}
                className={`absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  isStrikerZone && isKeeperZone ? "bg-[rgba(124,58,237,0.6)]" : isStrikerZone ? "bg-[rgba(224,35,42,0.55)]" : "shadow-[inset_0_0_0_4px_var(--color-sky-500)]"
                }`}
                style={point}
              />
            );
          })}
      </div>

      {/* Персонаж у ворот (роль keeper) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`keeper-${keeperCharacter.headId}-${keeperCharacter.bodyId}-${keeperCharacter.legsId}-${isStriker}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute z-[2] -translate-x-1/2 -translate-y-1/2"
          style={{ left: "72%", top: "46%" }}
        >
          {!isStriker && <YouArrow />}
          <CharacterSprite character={keeperCharacter} size="sm" />
        </motion.div>
      </AnimatePresence>

      {/* Мяч */}
      <Ball result={result} />

      {/* Персонаж у мяча (роль striker) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`striker-${strikerCharacter.headId}-${strikerCharacter.bodyId}-${strikerCharacter.legsId}-${isStriker}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute z-[3] -translate-x-1/2 -translate-y-1/2"
          style={{ left: "24%", top: "82%" }}
        >
          {isStriker && <YouArrow />}
          <CharacterSprite character={strikerCharacter} size="lg" />
        </motion.div>
      </AnimatePresence>

      {/* Кнопки зон — на реальных местах ворот, цвет по МОЕЙ роли */}
      {!result && (
        <div className="absolute inset-0 z-[6]" role="group" aria-label={isStriker ? "Wybierz miejsce strzału" : "Wybierz miejsce obrony"}>
          {ZONES.map((zone) => (
            <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={zoneButtonPosition(zone.id)}>
              <ZoneButton zone={zone.id} points={zone.points} role={zoneRole} selected={myZone === zone.id} disabled={hasChosen} onClick={onSelectZone} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
