import type { CharacterSelection, RoundResolvedPayload } from "../../../game/types";
import CharacterSprite from "../../../feature/character-builder/ui/CharacterSprite";
import GameButton from "../../../components/ui/Button";
import gameScreenArt from "../../../assets/gameScreen.jpg";
import { ZONES, ZONE_POINT, KEEPER_SPOT, STRIKER_SPOT, zoneButtonPosition, type ZoneId } from "../model/zoneLayout";
import Ball from "./Ball";

export interface PenaltySceneProps {
  strikerCharacter: CharacterSelection;
  keeperCharacter: CharacterSelection;
  /** Роль ЛОКАЛЬНОГО игрока — решает, где рисовать стрелочку "это ты". */
  isStriker: boolean;
  myZone: ZoneId | null;
  result: RoundResolvedPayload | null;
  hasChosen: boolean;
  onSelectZone: (zone: ZoneId) => void;
}

// Маленькая стрелочка над своим персонажем — единственный способ отличить
// "это я" в единой сцене без раздельных камер атаки/защиты. Смещение в cqh
// (см. [container-type:size] на арене ниже) — так она держится над головой
// при любом размере арены, а не только при том px, под который её когда-то
// подогнали руками. Бесконечное "покачивание" — на чистом CSS
// (.animate-arrow-bob, см. index.css), не на Framer Motion — та же причина,
// что и у .animate-podium-float там же.
function YouArrow() {
  return (
    <div
      className="animate-arrow-bob absolute -top-[3.6cqh] left-1/2 h-[2.4cqh] w-[3cqh] min-h-3 min-w-4"
      aria-hidden="true"
    >
      <svg viewBox="0 0 22 18" className="h-full w-full">
        <path d="M11 18 L0 4 L22 4 Z" fill="var(--color-gold-500)" stroke="#04070d" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Единая сцена: одна и та же камера для обоих игроков, арена — арт от
// Даниила (assets/gameScreen.jpg, ворота анфас). Сцена занимает ВЕСЬ
// доступный экран без карточки/рамки — на киоске это не превью, это сама
// игра. "У ворот" и "у мяча" — фиксированные места на арте; какая РОЛЬ там
// стоит решают strikerRole/keeperRole, а не то, кто смотрит — поэтому при
// смене ролей между раундами персонажи визуально меняются местами (key на
// смену роли пересоздаёт узел — см. .animate-character-enter в index.css),
// а не переключается вся камера.
//
// [container-type:size] на арене — ключевая деталь: рост персонажей
// (CharacterSprite), стрелочка и зоны удара завязаны на cqh/cqw контейнера,
// а не на vh/px экрана. Это единственный способ не потерять пропорции
// "персонаж vs ворота" при другом разрешении киоска.
export default function PenaltyScene({ strikerCharacter, keeperCharacter, isStriker, myZone, result, hasChosen, onSelectZone }: PenaltySceneProps) {
  const strikerZone = result ? (result.strikerZone as ZoneId) : null;
  const keeperZone = result ? (result.keeperZone as ZoneId) : null;

  return (
    <div className="relative h-full w-full overflow-hidden [container-type:size]">
      {/* Арена — на весь экран, без карточки и скруглений */}
      <img src={gameScreenArt} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      {/* Лёгкое затемнение по краям — читаемость HUD/оверлеев поверх яркого арта */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,10,20,0.32)_0%,rgba(3,10,20,0.02)_22%,rgba(3,10,20,0.02)_68%,rgba(3,10,20,0.4)_100%)]"
        aria-hidden="true"
      />

      {/* Персонаж у ворот (роль keeper) — ступни на линии газона в воротах, не в воздухе.
          key меняется при смене ролей между раундами, React пересоздаёт узел, CSS-анимация запускается заново. */}
      <div
        key={`keeper-${keeperCharacter.headId}-${keeperCharacter.bodyId}-${keeperCharacter.legsId}-${isStriker}`}
        className="animate-character-enter absolute z-[2]"
        style={{ left: `${KEEPER_SPOT.x}%`, top: `${KEEPER_SPOT.y}%` }}
      >
        {!isStriker && <YouArrow />}
        <CharacterSprite character={keeperCharacter} size="sm" />
      </div>

      {/* Мяч */}
      <Ball result={result} />

      {/* Персонаж у мяча (роль striker) */}
      <div
        key={`striker-${strikerCharacter.headId}-${strikerCharacter.bodyId}-${strikerCharacter.legsId}-${isStriker}`}
        className="animate-character-enter absolute z-[3]"
        style={{ left: `${STRIKER_SPOT.x}%`, top: `${STRIKER_SPOT.y}%` }}
      >
        {isStriker && <YouArrow />}
        <CharacterSprite character={strikerCharacter} size="lg" />
      </div>

      {/* Подсветка зон после удара — куда целился нападающий / куда прыгнул вратарь */}
      {result &&
        ZONES.map((zone) => {
          const point = ZONE_POINT[zone.id];
          const isStrikerZone = strikerZone === zone.id;
          const isKeeperZone = keeperZone === zone.id;
          if (!isStrikerZone && !isKeeperZone) return null;
          return (
            <div
              key={zone.id}
              className={`absolute z-[5] h-[7cqh] w-[7cqh] min-h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                isStrikerZone && isKeeperZone ? "bg-[rgba(124,58,237,0.6)]" : isStrikerZone ? "bg-[rgba(224,35,42,0.55)]" : "shadow-[inset_0_0_0_4px_var(--color-sky-500)]"
              }`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          );
        })}

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
