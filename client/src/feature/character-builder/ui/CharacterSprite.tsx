import { HEAD_OPTIONS, BODY_OPTIONS, LEGS_OPTIONS, getOptionById } from "../model/options";
import type { CharacterSelection } from "../../../game/types";

interface CharacterSpriteProps {
  character: CharacterSelection;
  /** "xl" — стенд в конструкторе, "lg"/"sm" — сцена матча (свой/дальний). */
  size?: "xl" | "lg" | "sm";
}

const DIMS = {
  xl: { head: "h-24 w-24", body: "h-48 w-40", leg: "h-24 w-13", iconHead: 38, iconBody: 50, iconLeg: 26 },
  lg: { head: "h-16 w-16", body: "h-32 w-28", leg: "h-16 w-9", iconHead: 26, iconBody: 34, iconLeg: 18 },
  sm: { head: "h-7 w-7", body: "h-14 w-12", leg: "h-7 w-4", iconHead: 12, iconBody: 16, iconLeg: 8 },
} as const;

// Заглушка-персонаж: та же тройка голова/торс/ноги, что и в конструкторе,
// собранная в силуэт "спиной к камере". Единственная точка замены на
// реальный арт позже — CharacterOption.imageUrl (см. ../model/options.ts).
// Переиспользуется и сценой матча (screens/GameScreen), и стендом
// конструктора персонажа (CustomizationScreen) — единое место для всего,
// что рисует персонажа.
export default function CharacterSprite({ character, size = "lg" }: CharacterSpriteProps) {
  const head = getOptionById(HEAD_OPTIONS, character.headId);
  const body = getOptionById(BODY_OPTIONS, character.bodyId);
  const legs = getOptionById(LEGS_OPTIONS, character.legsId);
  const dims = DIMS[size];

  return (
    <div className="flex flex-col items-center drop-shadow-[0_8px_10px_rgba(0,0,0,0.4)]">
      <div className={`flex items-center justify-center rounded-full border-2 border-black/25 ${dims.head} ${head.colorClass}`}>
        <head.icon size={dims.iconHead} strokeWidth={2.5} className="text-[var(--color-ink-900)]" />
      </div>
      <div className={`-mt-1 flex items-center justify-center rounded-2xl border-2 border-black/25 ${dims.body} ${body.colorClass}`}>
        <body.icon size={dims.iconBody} strokeWidth={2.5} className="text-[var(--color-ink-900)]" />
      </div>
      <div className="-mt-1 flex gap-1.5">
        <div className={`flex items-center justify-center rounded-lg border-2 border-black/25 ${dims.leg} ${legs.colorClass}`}>
          <legs.icon size={dims.iconLeg} strokeWidth={2.5} className="text-[var(--color-ink-900)]" />
        </div>
        <div className={`flex items-center justify-center rounded-lg border-2 border-black/25 ${dims.leg} ${legs.colorClass}`}>
          <legs.icon size={dims.iconLeg} strokeWidth={2.5} className="text-[var(--color-ink-900)]" />
        </div>
      </div>
    </div>
  );
}
