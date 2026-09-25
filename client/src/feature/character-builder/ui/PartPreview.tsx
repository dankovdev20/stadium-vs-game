import type { CharacterSelection } from "../../../game/types";
import PixelSprite from "./PixelSprite";
import type { PartKey } from "../model/sprites";

const ID_KEY = { head: "headId", body: "bodyId", legs: "legsId" } as const;

// Окна кадрирования деталей в кадре 64×64 — замерены по всем вариантам
// (голова вместе с кудрями/короной, корпус с руками, ноги со стопами).
const CROP: Record<PartKey, { x: number; y: number; w: number; h: number }> = {
  head: { x: 14, y: 0, w: 36, h: 42 },
  body: { x: 14, y: 30, w: 36, h: 23 },
  legs: { x: 16, y: 44, w: 32, h: 20 },
};

interface PartPreviewProps {
  part: PartKey;
  optionId: number;
  /** Что сейчас надето — остальные части превью берутся отсюда. */
  outfit: CharacterSelection;
  /** Целый масштаб для каждой категории — детали разного размера. */
  scale: Record<PartKey, number>;
  /** Высота поля превью в px — детали центрируются в нём по вертикали. */
  height: number;
}

// Превью одной детали для вкладок и карточек гардероба: персонаж в том, что
// ребёнок уже выбрал, с ЭТИМ вариантом детали; стоп-кадр "лицом к нам",
// кадрирование по области детали. Одетый, а не голый персонаж — намеренно:
// на голой базе в кадр футболки попадал пах, в кадры головы и ног — голые
// плечи и живот. Заодно видно, как вариант сочетается с остальным нарядом.
export default function PartPreview({ part, optionId, outfit, scale, height }: PartPreviewProps) {
  const character: CharacterSelection = { ...outfit, [ID_KEY[part]]: optionId };
  return (
    <div className="grid w-full place-items-center" style={{ height }}>
      <PixelSprite character={character} anim="idle" direction="down" mode="still" scale={scale[part]} crop={CROP[part]} />
    </div>
  );
}
