/**
 * Геометрия зон 1–5 на арт-фоне сцены (см. ui/PenaltyScene.tsx, assets/gameScreen.jpg).
 * Зеркалит таблицу зон из server/src/gameRules.js (названия/очки), но здесь
 * только позиция — игровой логики нет, результат раунда всегда приходит с сервера.
 *
 * Ворота на арте нарисованы строго анфас (не в ракурсе), поэтому зоны легли
 * симметрично — координаты подобраны вручную по сетке ворот на картинке
 * (1698×926, см. fromArtX/fromArtY ниже про то, как они переводятся в
 * проценты сцены).
 */

export type ZoneId = 1 | 2 | 3 | 4 | 5;

export interface ZoneDef {
  id: ZoneId;
  name: string;
  points: 1 | 2;
  isTop: boolean;
}

export const ZONES: readonly ZoneDef[] = [
  { id: 1, name: "Góra-Lewo", points: 2, isTop: true },
  { id: 2, name: "Góra-Środek", points: 2, isTop: true },
  { id: 3, name: "Góra-Prawo", points: 2, isTop: true },
  { id: 4, name: "Dół-Lewo", points: 1, isTop: false },
  { id: 5, name: "Dół-Prawo", points: 1, isTop: false },
];

export function getZoneName(id: number | null | undefined): string {
  return ZONES.find((z) => z.id === id)?.name ?? "—";
}

export function isZoneId(value: number): value is ZoneId {
  return value >= 1 && value <= 5 && Number.isInteger(value);
}

/**
 * Арена теперь ЗАНИМАЕТ ВЕСЬ КИОСК (1920×1080, см. PenaltyScene/GameScreen —
 * сцена вышла из общего flex-потока и стала абсолютным фоном на весь
 * вьюпорт). Это принципиально меняет обрезку object-cover по сравнению со
 * старой версией, где сцена жила в зажатом паддингами контейнере:
 *
 *   арт 1698×926 → соотношение 1.8337
 *   киоск 1920×1080 → соотношение 1.7778
 *
 * Соотношение киоска МЕНЬШЕ соотношения арта — значит object-cover теперь
 * масштабирует картинку ПО ВЫСОТЕ (без обрезки сверху/снизу вообще) и
 * обрезает лишнее по ШИРИНЕ, симметрично слева/справа (~1.53% с каждой
 * стороны). Раньше было ровно наоборот (обрезка по Y, X не трогалась) —
 * если координата ниже проходила через старый fromArtY, для новой версии
 * это давало бы неверный результат.
 *
 * Все константы ниже (ZONE_POINT/GOAL_LANDMARKS) заданы в "координатах
 * арта" — процентах от самого файла gameScreen.jpg (1698×926), измерено
 * вручную по сетке. fromArtX/fromArtY переводят их в проценты СЦЕНЫ
 * (контейнера) под текущую обрезку. Если разрешение киоска когда-нибудь
 * изменится — пересчитать здесь только эти две функции.
 */
const ART_ASPECT = 1698 / 926;
const STAGE_ASPECT = 1920 / 1080;

// Доля ширины арта, обрезаемая object-cover с ОДНОЙ стороны (лево ИЛИ право).
const ART_SIDE_CROP = 1 - STAGE_ASPECT / ART_ASPECT; // ≈ 0.03061 -> /2 с каждой стороны
const ART_VISIBLE_WIDTH = 1 - ART_SIDE_CROP; // видимая доля ширины арта

function fromArtX(artXPercent: number): number {
  return (artXPercent - (ART_SIDE_CROP / 2) * 100) / ART_VISIBLE_WIDTH;
}

// Высота арта под full-bleed НЕ обрезается — координата Y арта совпадает
// с координатой Y сцены 1:1. Функция оставлена (а не удалена), чтобы все
// точки ниже одинаково проходили через "перевод из арта" — если пропорции
// киоска когда-нибудь изменятся, менять придётся только эту функцию, а не
// каждую точку по отдельности.
function fromArtY(artYPercent: number): number {
  return artYPercent;
}

/** Центр каждой зоны ворот на сцене, в процентах от контейнера сцены. */
export const ZONE_POINT: Record<ZoneId, { x: number; y: number }> = {
  1: { x: fromArtX(48.9), y: fromArtY(41.0) },
  2: { x: fromArtX(63.0), y: fromArtY(35.0) },
  3: { x: fromArtX(77.1), y: fromArtY(41.0) },
  4: { x: fromArtX(48.9), y: fromArtY(60.5) },
  5: { x: fromArtX(77.1), y: fromArtY(60.5) },
};

/** Ориентиры рамки ворот на арте — для мяча и эффектов удара (см. ui/Ball.tsx). */
export const GOAL_LANDMARKS = {
  postLeft: { x: fromArtX(41.2), y: fromArtY(50) },
  postRight: { x: fromArtX(85.0), y: fromArtY(50) },
  crossbarCenter: { x: fromArtX(63.0), y: fromArtY(33.3) },
  overBar: { x: fromArtX(63.0), y: fromArtY(10) },
  /** Линия ворот — где штанги касаются газона (нижний край рамки ворот). */
  groundY: fromArtY(70.2),
  goalCenterX: fromArtX(63.0),
};

/**
 * Персонажи заякорены по СТОПАМ (bottom-center), не по верхнему левому
 * углу спрайта — см. PenaltyScene: обёртка персонажа несёт
 * translate(-50%, -100%). Это единственный способ надёжно "поставить"
 * персонажа на конкретную линию газона независимо от его роста (sm/lg).
 *
 * Вратарь стоит НА линии ворот/чуть перед ней — не в глубине сетки. Раньше
 * якорь был top-left и точка задавала верх спрайта где-то в середине
 * сетки — визуально читалось как "вратарь висит внутри ворот".
 *
 * +6.8% от линии ворот (не +2%, как было раньше) — второй заход по той же
 * жалобе: при +2% голова вратаря (30cqh) начиналась на 42.2% сцены и
 * пересекалась с кнопкой зоны 2 (центр на 35%, ±8cqh половина высоты ->
 * нижний край на 43%). +6.8% поднимает макушку до 47% — чистый зазор ~4pt
 * от кнопки при любом её положении. Заодно решает и исходную жалобу ещё
 * заметнее: вратарь визуально дальше выходит из сетки на траву.
 */
export const KEEPER_SPOT = { x: GOAL_LANDMARKS.goalCenterX, y: GOAL_LANDMARKS.groundY + 6.8 };

/** Нападающий — ближний план, стопы на траве в нижней левой трети экрана. */
export const STRIKER_SPOT = { x: 17, y: 89 };

/** Позиция кнопки зоны на сцене — просто центр зоны, без искажений. */
export function zoneButtonPosition(zone: ZoneId) {
  const point = ZONE_POINT[zone];
  return { left: `${point.x}%`, top: `${point.y}%` };
}
