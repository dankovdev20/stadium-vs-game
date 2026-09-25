import { type CSSProperties } from "react";
import { cn } from "../../../components/ui/cn";
import type { CharacterSelection } from "../../../game/types";
import { BODY_OPTIONS, HEAD_OPTIONS, LEGS_OPTIONS, getOptionById } from "../model/options";
import {
  FRAME,
  PART_ORDER,
  animInfo,
  baseUrl,
  partIds,
  partUrl,
  rowFor,
  type AnimName,
  type Direction,
  type PartKey,
} from "../model/sprites";

export type SpriteMode = "loop" | "once" | "still";

export interface PixelSpriteProps {
  character: CharacterSelection;
  /** Какие части надеть поверх голого тела; по умолчанию все три. */
  parts?: PartKey[];
  anim: AnimName;
  direction: Direction;
  /** Целый множитель — иначе "пиксели" получаются разной ширины. */
  scale: number;
  /** loop — по кругу; once — один раз и держать последний кадр; still — стоп-кадр `frame`. */
  mode?: SpriteMode;
  /** Длительность одного кадра, мс. */
  frameMs?: number;
  /** Задержка старта (кадр 0 держится всю задержку). */
  delayMs?: number;
  frame?: number;
  /** Окно внутри кадра 64×64 (в пикселях кадра) — для превью деталей. */
  crop?: { x: number; y: number; w: number; h: number };
  className?: string;
  style?: CSSProperties;
}

const OPTIONS = { head: HEAD_OPTIONS, body: BODY_OPTIONS, legs: LEGS_OPTIONS } as const;
const ID_KEY = { head: "headId", body: "bodyId", legs: "legsId" } as const;

// Слоёный пиксельный персонаж: [слои "за спиной"] → голое тело → ноги →
// корпус → голова (порядок и деление — см. scripts/characters). Все листы
// одной анимации имеют одну и ту же сетку кадров, поэтому каждый слой —
// просто div с background-image, а анимация — сдвиг background-position-x
// шагами steps() (keyframes sprite-run в index.css).
//
// Синхронность слоёв: все они монтируются ВМЕСТЕ (общий key на обёртке) и
// получают одинаковую анимацию — значит идут кадр в кадр. Смена детали или
// анимации пересоздаёт весь стек, а не один слой — иначе новый слой начал бы
// с кадра 0, пока остальные уже на середине цикла.
export default function PixelSprite({
  character,
  parts = PART_ORDER,
  anim,
  direction,
  scale,
  mode = "loop",
  frameMs = 120,
  delayMs = 0,
  frame = 0,
  crop,
  className,
  style,
}: PixelSpriteProps) {
  const { frames, rows } = animInfo(anim);
  const row = rowFor(anim, direction);
  const cell = FRAME * scale;
  const view = crop ?? { x: 0, y: 0, w: FRAME, h: FRAME };

  const ids = PART_ORDER.map((part) => (parts.includes(part) ? getOptionById(OPTIONS[part], character[ID_KEY[part]]).id : null));
  const backs = PART_ORDER.flatMap((part, i) => {
    const id = ids[i];
    const hasBack = id !== null && partIds(part).find((p) => p.id === id)?.back;
    return hasBack ? [partUrl(part, id, anim, true)] : [];
  });
  const fronts = PART_ORDER.flatMap((part, i) => (ids[i] === null ? [] : [partUrl(part, ids[i], anim)]));
  const layers = [...backs, baseUrl(anim), ...fronts].filter((url): url is string => !!url);

  const animationStyle: CSSProperties =
    mode === "still"
      ? { backgroundPositionX: -Math.min(frame, frames - 1) * cell }
      : mode === "once"
        ? ({
            "--sprite-to": `${-(frames - 1) * cell}px`,
            animation: `sprite-run ${(frames - 1) * frameMs}ms steps(${frames - 1}) ${delayMs}ms 1 both`,
          } as CSSProperties)
        : ({
            "--sprite-to": `${-frames * cell}px`,
            animation: `sprite-run ${frames * frameMs}ms steps(${frames}) ${delayMs}ms infinite both`,
          } as CSSProperties);

  return (
    <div
      className={cn("pointer-events-none relative overflow-hidden", className)}
      style={{ width: view.w * scale, height: view.h * scale, ...style }}
      aria-hidden="true"
    >
      <div key={`${anim}|${direction}|${mode}|${delayMs}|${frame}|${ids.join(",")}`} className="contents">
        {layers.map((url, i) => (
          <div
            key={i}
            className="pixelated absolute bg-no-repeat"
            style={{
              left: -view.x * scale,
              top: -view.y * scale,
              width: cell,
              height: cell,
              backgroundImage: `url(${url})`,
              backgroundSize: `${frames * cell}px ${rows * cell}px`,
              backgroundPositionY: -row * cell,
              ...animationStyle,
            }}
          />
        ))}
      </div>
    </div>
  );
}
