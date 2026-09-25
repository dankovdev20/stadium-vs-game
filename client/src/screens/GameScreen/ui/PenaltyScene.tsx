import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { CharacterSelection, RoundResolvedPayload } from "../../../game/types";
import GameButton from "../../../components/ui/Button";
import { stagePointToViewport } from "../../../components/layout/kioskScale";
import gameScreenArt from "../../../assets/gameScreen.jpg";
import { ZONES, KEEPER_SPOT, STRIKER_SPOT, zoneButtonPosition, type ZoneId } from "../model/zoneLayout";
import { buildBallChoreography, buildKeeperPose } from "../model/reveal";
import Ball from "./Ball";
import ImpactFX from "./ImpactFX";
import { KeeperFigure, StrikerFigure } from "./SceneCharacters";

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
// [container-type:size] на арене: зоны удара и эффекты завязаны на cqh/cqw
// контейнера. Персонажи — пиксельные спрайты целого масштаба (см.
// SceneCharacters): сцена всегда 1920×1080 (components/layout/KioskStage),
// поэтому их px-размер и есть доля сцены.
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
          <KeeperFigure character={keeperCharacter} isMe={!isStriker} result={result} pose={keeperPose} />
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
          <StrikerFigure character={strikerCharacter} isMe={isStriker} result={result} />
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
