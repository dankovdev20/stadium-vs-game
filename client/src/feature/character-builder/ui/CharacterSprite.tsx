import { HEAD_OPTIONS, BODY_OPTIONS, LEGS_OPTIONS, getOptionById } from "../model/options";
import type { CharacterSelection } from "../../../game/types";
import PlayerCharacter from "../svg/PlayerCharacter";

interface CharacterSpriteProps {
  character: CharacterSelection;
  /** "xl" — стенд в конструкторе, "lg"/"sm" — сцена матча (свой/дальний). */
  size?: "xl" | "lg" | "sm";
}

// Пропорции контейнера повторяют viewBox PlayerCharacter (200×322). У "xl"
// высота берётся от родителя (PodiumStage сам решает, сколько места отдать
// подиуму на 1920×1080), у "lg"/"sm" — фиксированные px для сцены матча.
const DIMS = {
  xl: "h-full aspect-[200/322]",
  lg: "h-[182px] w-[113px]",
  sm: "h-[84px] w-[52px]",
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
