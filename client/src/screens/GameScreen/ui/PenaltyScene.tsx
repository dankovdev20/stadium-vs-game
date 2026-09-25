import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { CharacterSelection, RoundResolvedPayload } from "../../../game/types";
import CharacterSprite from "../../../feature/character-builder/ui/CharacterSprite";
import GameButton from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";
import { stagePointToViewport } from "../../../components/layout/kioskScale";
import gameScreenArt from "../../../assets/gameScreen.jpg";
import { ZONES, KEEPER_SPOT, STRIKER_SPOT, zoneButtonPosition, type ZoneId } from "../model/zoneLayout";
import { buildBallChoreography, buildKeeperPose } from "../model/reveal";
import Ball from "./Ball";
import ImpactFX from "./ImpactFX";
import PoseLayer from "./PoseLayer";

const CONFETTI_COLORS = ["#0f8a45", "#ffffff", "#d7282f", "#ffc93c"];

export interface PenaltySceneProps {
  strikerCharacter: CharacterSelection;
  keeperCharacter: CharacterSelection;
  /** Роль ЛОКАЛЬНОГО игрока — решает, у кого рисовать кольцо-маркер "это ты". */
  isStriker: boolean;
  myZone: ZoneId | null;
  result: RoundResolvedPayload | null;
  hasChosen: boolean;
  onSelectZone: (zone: ZoneId) => void;
}

// Кольцо-маркер "это ты" под ногами персонажа — пришло на смену стрелке
// над головой. Стрелка сидела в той же полосе высоты, что и кнопки зон
// удара, и на зоне 2 перекрывалась одновременно с головой вратаря (см.
// историю разработки) — а кольцо у стоп физически не может столкнуться ни
// с одной кнопкой зоны при любой раскладке, потому что кнопки живут у
// головы/торса, а не у земли.
//
// Геометрия кольца НЕ своя — это геометрия GroundShadow (тот же h-[14%],
// тот же bottom:0, та же ширина в процентах от персонажа), только шире на
// ~25%. Раньше кольцо считало собственные пропорции/позицию с нуля и в
// двух заходах подряд промахивалось (то поверх головы, то "блином", то
// висело на щиколотках) — а тень под ногами уже была той формой, которая
// нужна, её просто было не видно рядом с кольцом-переростком. Проще и
// надёжнее в буквальном смысле наложить кольцо НА тень, унаследовав её
// форму, чем изобретать отдельный эллипс.
//
// Подпись — та же золотая пиксельная метка (Tag), что "TY" на табло и
// выбранные элементы по всей игре: золото = "это ты".
// Пульсация — чистый CSS (.animate-you-ring-pulse, см. index.css), не
// Framer Motion — та же причина, что и у .animate-podium-float там же:
// перерисовки родителя её не прерывают.
function YouMarker({ shadowWidth }: { shadowWidth: string }) {
  return (
    <>
      <div
        className="animate-you-ring-pulse absolute bottom-0 left-1/2 h-[14%] min-h-4 -translate-x-1/2 rounded-[50%] border-[0.55cqh] border-gold-500 shadow-[0_0_0_3px_var(--color-ink)]"
        style={{ width: `calc(${shadowWidth} * 1.25)` }}
        aria-hidden="true"
      />
      <Tag tone="gold" size="sm" className="absolute bottom-[-78px] left-1/2 -translate-x-1/2 text-[24px] uppercase" aria-hidden="true">
        To ty
      </Tag>
    </>
  );
}

// Тень-контакт под ногами персонажа — дешёвый, но важный сигнал "стоит на
// траве", а не "наклеен на картинку". Без неё вратарь на линии ворот и
// раньше визуально сливался с сеткой за спиной.
function GroundShadow({ width }: { width: string }) {
  return (
    <div
      className="absolute bottom-0 left-1/2 h-[14%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(4,8,4,0.45)_0%,rgba(4,8,4,0)_72%)]"
      style={{ width }}
      aria-hidden="true"
    />
  );
}

// Единая сцена: одна и та же камера для обоих игроков, арена — арт от
// Даниила (assets/gameScreen.jpg, ворота анфас). Сцена — это ВЕСЬ киоск
// (см. GameScreen: PenaltyScene абсолютным слоем на весь вьюпорт, без
// карточки/паддингов) — не превью, а сама игра. "У ворот" и "у мяча" —
// фиксированные места на арте; какая РОЛЬ там стоит решают
// strikerRole/keeperRole, а не то, кто смотрит — поэтому при смене ролей
// между раундами персонажи визуально меняются местами (key на смену роли
// пересоздаёт узел — см. .animate-character-enter в index.css), а не
// переключается вся камера.
//
// [container-type:size] на арене — ключевая деталь: рост персонажей
// (CharacterSprite), стрелочка и зоны удара завязаны на cqh/cqw контейнера,
// а не на vh/px экрана. Это единственный способ не потерять пропорции
// "персонаж vs ворота" при другом разрешении киоска.
//
// Якорь персонажей — СТОПЫ (translate(-50%, -100%)), не верхний левый угол:
// KEEPER_SPOT/STRIKER_SPOT (см. model/zoneLayout) задают именно точку на
// газоне, где стоят ноги, рост уходит вверх от неё. Раньше якорь был
// top-left, и вратарь визуально "висел" где-то в середине сетки ворот.
// Конфетти (canvas-confetti) — только для GOL, стреляет из точки попадания
// мяча. Холст конфетти лежит на весь вьюпорт, а сцена — 1920×1080 по центру
// (см. components/layout/KioskStage), поэтому точку сцены переводим в долю
// вьюпорта через stagePointToViewport (на киоске это просто contactPoint%/100).
// Задержка = моменту касания в
// хореографии мяча (см. model/reveal.ts) — иначе конфетти взорвётся раньше,
// чем мяч долетит до сетки, и вся синхронизация развалится.
function useGoalConfetti(result: RoundResolvedPayload | null) {
  useEffect(() => {
    if (!result || result.result.outcome !== "GOL") return;
    const choreography = buildBallChoreography(result);
    const delayMs = choreography.impactAt * choreography.durationSec * 1000;
    const origin = stagePointToViewport(choreography.contactPoint.x, choreography.contactPoint.y);

    const id = setTimeout(() => {
      // Квадратное конфетти в цветах шарфа WKS + золото — пиксельное, как весь стадион.
      confetti({ particleCount: 70, spread: 65, startVelocity: 38, gravity: 1.1, ticks: 130, origin, shapes: ["square"], colors: CONFETTI_COLORS });
      confetti({ particleCount: 40, spread: 100, startVelocity: 24, ticks: 110, origin, scalar: 0.75, shapes: ["square"], colors: CONFETTI_COLORS });
    }, delayMs);

    return () => clearTimeout(id);
  }, [result]);
}

export default function PenaltyScene({ strikerCharacter, keeperCharacter, isStriker, myZone, result, hasChosen, onSelectZone }: PenaltySceneProps) {
  useGoalConfetti(result);

  const choreography = result ? buildBallChoreography(result) : null;
  const keeperPose = result ? buildKeeperPose(result) : null;
  const shakeOnImpact = choreography?.presentation.ball === "post";
  const shakeDelayMs = choreography ? Math.round(choreography.impactAt * choreography.durationSec * 1000) : 0;

  return (
    <div className="relative h-full w-full overflow-hidden [container-type:size]">
      {/* Арена — на весь экран, без карточки и скруглений. Обёртка-тряска —
          отдельный узел ВНУТРИ [container-type:size] (а не сам корень): у
          неё свой key на раунд, чтобы CSS-анимация тряски (см.
          .animate-screen-shake, index.css) проигрывалась заново каждый
          раунд, не трогая при этом cqh-контекст арены. */}
      <div key={result?.round ?? "idle"} className={shakeOnImpact ? "animate-screen-shake absolute inset-0" : "absolute inset-0"} style={shakeOnImpact ? { animationDelay: `${shakeDelayMs}ms` } : undefined}>
        <img src={gameScreenArt} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        {/* Лёгкое затемнение по краям — читаемость HUD/оверлеев поверх яркого арта */}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,20,0.38)_0%,rgba(3,10,20,0.02)_18%,rgba(3,10,20,0.02)_66%,rgba(3,10,20,0.46)_100%)]"
          aria-hidden="true"
        />

        {/* Персонаж у ворот (роль keeper) — стопы на линии ворот, не в воздухе.
            key меняется при смене ролей между раундами, React пересоздаёт узел, CSS-анимация запускается заново.
            PoseLayer — отдельный слой ПОД якорем: реакция (нырок/поймал/пропустил) не конфликтует
            с transform CSS-анимации входа на самом якоре (см. ui/PoseLayer.tsx). */}
        <div
          key={`keeper-${keeperCharacter.headId}-${keeperCharacter.bodyId}-${keeperCharacter.legsId}-${isStriker}`}
          className="animate-character-enter absolute z-[2]"
          style={{ left: `${KEEPER_SPOT.x}%`, top: `${KEEPER_SPOT.y}%` }}
        >
          <GroundShadow width="70%" />
          {!isStriker && <YouMarker shadowWidth="70%" />}
          <PoseLayer pose={keeperPose}>
            <CharacterSprite character={keeperCharacter} size="sm" />
          </PoseLayer>
        </div>

        {/* Мяч */}
        <Ball result={result} />

        {/* Эффект момента удара — вспышка/кольцо/искры в точке касания, синхронизировано с полётом мяча */}
        {result && choreography && <ImpactFX choreography={choreography} roundKey={result.round} />}

        {/* Персонаж у мяча (роль striker) */}
        <div
          key={`striker-${strikerCharacter.headId}-${strikerCharacter.bodyId}-${strikerCharacter.legsId}-${isStriker}`}
          className="animate-character-enter absolute z-[3]"
          style={{ left: `${STRIKER_SPOT.x}%`, top: `${STRIKER_SPOT.y}%` }}
        >
          <GroundShadow width="60%" />
          {isStriker && <YouMarker shadowWidth="60%" />}
          <CharacterSprite character={strikerCharacter} size="lg" />
        </div>
      </div>

      {/* Кнопки зон — единый GameButton (size="zone"), цвет по МОЕЙ роли */}
      {!result && (
        <div className="absolute inset-0 z-[6]" role="group" aria-label={isStriker ? "Wybierz miejsce strzału" : "Wybierz miejsce obrony"}>
          {ZONES.map((zone) => (
            <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={zoneButtonPosition(zone.id)}>
              <GameButton
                size="zone"
                variant={isStriker ? "striker" : "keeper"}
                selected={myZone === zone.id}
                disabled={hasChosen}
                aria-label={`Zona ${zone.id}, ${zone.points} pkt`}
                aria-pressed={myZone === zone.id}
                onClick={() => onSelectZone(zone.id)}
              >
                <span className="font-display text-[9.6cqh] font-normal leading-[0.8]">{zone.id}</span>
                {/* Очки дважды: точками (сосчитать) и числом (прочитать) */}
                <span className="flex items-center gap-[0.55cqh] text-[2.2cqh] tracking-[0.06em]">
                  {Array.from({ length: zone.points }, (_, i) => (
                    <i key={i} className="block h-[1.1cqh] w-[1.1cqh] bg-current" />
                  ))}
                  {zone.points} PKT
                </span>
              </GameButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
