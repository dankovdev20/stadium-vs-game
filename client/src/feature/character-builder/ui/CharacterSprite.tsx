import { HEAD_OPTIONS, BODY_OPTIONS, LEGS_OPTIONS, getOptionById } from "../model/options";
import type { CharacterSelection } from "../../../game/types";
import PlayerCharacter from "../svg/PlayerCharacter";

interface CharacterSpriteProps {
  character: CharacterSelection;
  /** "xl" — стенд в конструкторе, "lg"/"sm" — сцена матча (свой/дальний). */
  size?: "xl" | "lg" | "sm";
}

// Пропорции контейнера повторяют viewBox PlayerCharacter (200×322). "xl"
// берёт высоту от родителя (PodiumStage сам решает, сколько места отдать
// подиуму на 1920×1080). "lg"/"sm" (сцена матча, ui/PenaltyScene) — в cqh
// (container query height) от арены-контейнера, а не в фиксированных px:
// на киоске сцена всегда должна масштабироваться как единое целое, иначе
// пропорция "персонаж vs ворота" плывёт при любом другом разрешении экрана.
// Разница lg/sm — 44/30 ≈ 1.47×, "ближе/дальше", а не "игрушечный"
// вратарь у огромных ворот (было 182/84px ≈ 2.2×). Оба размера крупные —
// сцена крупным планом, а не издалека (референс — боевые сцены покемонов).
const DIMS = {
  xl: "h-full aspect-[200/322]",
  lg: "h-[44cqh] aspect-[200/322]",
  sm: "h-[30cqh] aspect-[200/322]",
} as const;

// Единый рендер футболиста: голова/торс/ноги собираются из SVG
// (см. ../svg/PlayerCharacter). Переиспользуется и сценой матча
// (screens/GameScreen), и стендом конструктора персонажа
// (CustomizationScreen) — единое место для всего, что рисует персонажа.
export default function CharacterSprite({ character, size = "lg" }: CharacterSpriteProps) {
  const head = getOptionById(HEAD_OPTIONS, character.headId);
  const body = getOptionById(BODY_OPTIONS, character.bodyId);
  const legs = getOptionById(LEGS_OPTIONS, character.legsId);

  return (
    <div className={`drop-shadow-[0_8px_10px_rgba(0,0,0,0.4)] ${DIMS[size]}`}>
      <PlayerCharacter head={head} body={body} legs={legs} className="h-full w-full" />
    </div>
  );
}
