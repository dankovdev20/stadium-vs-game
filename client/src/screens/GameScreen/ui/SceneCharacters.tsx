import { useEffect, useState, type ReactNode } from "react";
import Tag from "../../../components/ui/Tag";
import CharacterSprite from "../../../feature/character-builder/ui/CharacterSprite";
import type { CharacterSelection, RoundResolvedPayload } from "../../../game/types";
import { buildBallChoreography, type KeeperPose } from "../model/reveal";
import { getOutcomePresentation } from "../model/outcomes";
import PoseLayer from "./PoseLayer";

// Целые масштабы спрайта 64×64 (рост персонажа — 47px кадра, корона — до
// верха кадра): вратарь ×6 ≈ 282px, нападающий ×10 ≈ 470px. Вратарь не ×7:
// тогда корона (верх кадра, y=0) поднималась до 398px и уходила под кнопку
// зоны 2 (низ ≈ 464px) — ровно то пересечение, от которого команда уже
// отодвигала вратаря (см. KEEPER_SPOT в model/zoneLayout). При ×6 корона
// кончается на 460px, остальные головы — ниже 520px.
const KEEPER_SCALE = 6;
const STRIKER_SCALE = 10;

// Тень-контакт под ногами — сигнал "стоит на траве", а не "наклеен на
// картинку". Центр — ровно в точке опоры (родитель — нулевая точка стоп).
function GroundShadow({ scale }: { scale: number }) {
  const w = 24 * scale;
  const h = 6 * scale;
  return (
    <div
      className="absolute rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(4,8,4,0.45)_0%,rgba(4,8,4,0)_72%)]"
      style={{ width: w, height: h, left: -w / 2, top: -h / 2 }}
      aria-hidden="true"
    />
  );
}

// Кольцо "это ты" — на той же оси, что и тень, шире на четверть; метка
// "TO TY" — под кольцом. Пульсация — CSS (.animate-you-ring-pulse): её
// transform не спорит с позиционированием, поэтому кольцо центрируется
// обёрткой, а пульсирует внутренний элемент.
function YouMarker({ scale }: { scale: number }) {
  const w = 30 * scale;
  const h = 7 * scale;
  return (
    <>
      <div className="absolute" style={{ width: w, height: h, left: -w / 2, top: -h / 2 }} aria-hidden="true">
        <div className="animate-you-ring-pulse h-full w-full rounded-[50%] border-[0.55cqh] border-gold-500 shadow-[0_0_0_3px_var(--color-ink)]" />
      </div>
      <div className="absolute left-0 -translate-x-1/2" style={{ top: h / 2 + 14 }} aria-hidden="true">
        <Tag tone="gold" size="sm" className="text-[24px] uppercase">
          To ty
        </Tag>
      </div>
    </>
  );
}

interface KeeperFigureProps {
  character: CharacterSelection;
  isMe: boolean;
  result: RoundResolvedPayload | null;
  pose: KeeperPose | null;
}

// Вратарь стоит лицом к камере ("down"). Ждёт в боевой стойке; на любой
// нырок (сейв или пропущенный гол) — один прыжок поверх наклона всего
// спрайта (PoseLayer); когда мяч летит мимо ворот — просто провожает его,
// оставаясь в стойке.
export function KeeperFigure({ character, isMe, result, pose }: KeeperFigureProps) {
  const dives = !!result && getOutcomePresentation(result.result.outcome).keeper !== "watch";
  return (
    <>
      <GroundShadow scale={KEEPER_SCALE} />
      {isMe && <YouMarker scale={KEEPER_SCALE} />}
      <PoseLayer pose={pose}>
        {dives ? (
          <CharacterSprite character={character} anim="jump" direction="down" mode="once" frameMs={90} scale={KEEPER_SCALE} />
        ) : (
          <CharacterSprite character={character} anim="combat_idle" direction="down" frameMs={450} scale={KEEPER_SCALE} />
        )}
      </PoseLayer>
    </>
  );
}

interface StrikerFigureProps {
  character: CharacterSelection;
  isMe: boolean;
  result: RoundResolvedPayload | null;
}

// Нападающий — спиной к камере ("up"), камера за ним, как в трансляции
// пенальти. Удар: кадры разбега одновременно с вылетом мяча; после касания
// (impactAt из той же хореографии, что двигает мяч) — радость на гол или
// обратно в стойку. Родитель пересоздаёт фигуру на каждый раунд (key на
// обёртке сцены), поэтому фаза всегда начинается заново.
export function StrikerFigure({ character, isMe, result }: StrikerFigureProps) {
  const [afterImpact, setAfterImpact] = useState(false);

  useEffect(() => {
    if (!result) return;
    const choreography = buildBallChoreography(result);
    const id = setTimeout(() => setAfterImpact(true), choreography.impactAt * choreography.durationSec * 1000);
    return () => clearTimeout(id);
  }, [result]);

  let sprite: ReactNode;
  if (!result) {
    sprite = <CharacterSprite character={character} anim="idle" direction="up" frameMs={450} scale={STRIKER_SCALE} />;
  } else if (!afterImpact) {
    sprite = <CharacterSprite character={character} anim="run" direction="up" mode="once" frameMs={60} scale={STRIKER_SCALE} />;
  } else if (result.result.isGoal) {
    sprite = <CharacterSprite character={character} anim="emote" direction="up" mode="once" frameMs={140} scale={STRIKER_SCALE} />;
  } else {
    sprite = <CharacterSprite character={character} anim="idle" direction="up" frameMs={450} scale={STRIKER_SCALE} />;
  }

  return (
    <>
      <GroundShadow scale={STRIKER_SCALE} />
      {isMe && <YouMarker scale={STRIKER_SCALE} />}
      {sprite}
    </>
  );
}
