import PixelSprite from "./PixelSprite";
import type { PartKey } from "../model/sprites";

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
  /** Целый масштаб для каждой категории — детали разного размера. */
  scale: Record<PartKey, number>;
  /** Высота поля превью в px — детали центрируются в нём по вертикали. */
  height: number;
}

// Превью одной детали для вкладок и карточек гардероба: голое тело + только
// эта деталь, стоп-кадр "лицом к нам", кадрирование по области детали.
export default function PartPreview({ part, optionId, scale, height }: PartPreviewProps) {
  const character = { headId: 1, bodyId: 1, legsId: 1, [`${part}Id`]: optionId };
  return (
    <div className="grid w-full place-items-center" style={{ height }}>
      <PixelSprite character={character} parts={[part]} anim="idle" direction="down" mode="still" scale={scale[part]} crop={CROP[part]} />
    </div>
  );
}
