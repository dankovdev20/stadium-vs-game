import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { CharacterSelection, RoundResolvedPayload } from "../../../game/types";
import CharacterSprite from "../../../feature/character-builder/ui/CharacterSprite";
import GameButton from "../../../components/ui/Button";
import gameScreenArt from "../../../assets/gameScreen.jpg";
import { ZONES, KEEPER_SPOT, STRIKER_SPOT, zoneButtonPosition, type ZoneId } from "../model/zoneLayout";
import { buildBallChoreography, buildKeeperPose } from "../model/reveal";
import Ball from "./Ball";
import ImpactFX from "./ImpactFX";
import PoseLayer from "./PoseLayer";

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
// Подпись — тот же пиксельно-терминальный язык, что в HUD и баннере
// результата (Press Start 2P, жёсткая рамка и тень без градиентов).
// Пульсация — чистый CSS (.animate-you-ring-pulse, см. index.css), не
// Framer Motion — та же причина, что и у .animate-podium-float там же:
// перерисовки родителя её не прерывают.
function YouMarker({ shadowWidth }: { shadowWidth: string }) {
  return (
    <>
      <div
        className="animate-you-ring-pulse absolute bottom-0 left-1/2 h-[14%] min-h-4 -translate-x-1/2 rounded-[50%] border-[0.4cqh] border-[var(--color-gold-500)] shadow-[0_0_0_2px_#04070d,0_0_1.2cqh_0.3cqh_rgba(255,201,60,0.6)]"
        style={{ width: `calc(${shadowWidth} * 1.25)` }}
        aria-hidden="true"
      />
      <span
        className="absolute bottom-[-3.4cqh] left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-[var(--color-gold-500)] bg-[#241c06e6] px-[1.2cqh] py-[0.4cqh] font-['Press_Start_2P'] text-[1.3cqh] leading-none text-[#ffe9a8] shadow-[0.3cqh_0.3cqh_0_rgba(0,0,0,0.45)]"
        aria-hidden="true"
      >
        TO TY
      </span>
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
// мяча (доля viewport 0..1, сцена = весь киоск, так что contactPoint%/100
// это ровно то, что просит canvas-confetti). Задержка = моменту касания в
// хореографии мяча (см. model/reveal.ts) — иначе конфетти взорвётся раньше,
// чем мяч долетит до сетки, и вся синхронизация развалится.
function useGoalConfetti(result: RoundResolvedPayload | null) {
  useEffect(() => {
    if (!result || result.result.outcome !== "GOL") return;
    const choreography = buildBallChoreography(result);
    const delayMs = choreography.impactAt * choreography.durationSec * 1000;
    const origin = { x: choreography.contactPoint.x / 100, y: choreography.contactPoint.y / 100 };

    const id = setTimeout(() => {
      confetti({ particleCount: 70, spread: 65, startVelocity: 38, gravity: 1.1, ticks: 130, origin, colors: ["#ffc93c", "#ffffff", "#2d7dd2"] });
      confetti({ particleCount: 40, spread: 100, startVelocity: 24, ticks: 110, origin, scalar: 0.75, colors: ["#e5484d", "#ffc93c"] });
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
                <span className="text-[4.6cqh] leading-none">{zone.id}</span>
                <span className="text-[1.6cqh] font-normal tracking-[0.1em] opacity-90">{zone.points} PKT</span>
              </GameButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
