/**
 * Геометрия зон 1–5 на арт-фоне сцены (см. ui/PenaltyScene.tsx, assets/gameScreen.jpg).
 * Зеркалит таблицу зон из server/src/gameRules.js (названия/очки), но здесь
 * только позиция — игровой логики нет, результат раунда всегда приходит с сервера.
 *
 * Ворота на арте нарисованы строго анфас (не в ракурсе), поэтому зоны легли
 * симметрично — координаты подобраны вручную по сетке ворот на картинке
 * (1698×926, см. fromArtY ниже про то, как они переводятся в проценты сцены).
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
 * Арена рисуется через object-cover (см. PenaltyScene) — на киоске 1920×1080
 * доступная под сцену область шире, чем пропорция самого арта (1698×926 ≈
 * 1.834), поэтому cover масштабирует ПО ШИРИНЕ и обрезает часть высоты
 * СВЕРХУ и СНИЗУ поровну. Измерено на реальном контейнере (1888×834):
 * обрезается ~10.56% высоты картинки с каждой стороны. Любая Y-координата,
 * которая должна попасть на нарисованный элемент (штанга, сетка, линия
 * газона), обязана пройти через эту поправку — иначе на кадре она "плывёт"
 * относительно самого рисунка (так и было до фикса: вратарь визуально висел
 * в воздухе, а не стоял на траве). X обрезка не касается.
 *
 * Если пропорции контейнера когда-нибудь изменятся (другой экран стенда) —
 * пересчитать ART_TOP_CROP по новым замерам.
 */
const ART_TOP_CROP = 0.1056;
const ART_VISIBLE_HEIGHT = 1 - ART_TOP_CROP * 2;

function fromArtY(artYPercent: number): number {
  return (artYPercent - ART_TOP_CROP * 100) / ART_VISIBLE_HEIGHT;
}

/** Центр каждой зоны ворот на сцене, в процентах от контейнера сцены. */
export const ZONE_POINT: Record<ZoneId, { x: number; y: number }> = {
  1: { x: 48.9, y: fromArtY(41.0) },
  2: { x: 63.0, y: fromArtY(38.0) },
  3: { x: 77.1, y: fromArtY(41.0) },
  4: { x: 48.9, y: fromArtY(60.5) },
  5: { x: 77.1, y: fromArtY(60.5) },
};

/** Ориентиры рамки ворот на арте — для мяча (штанга/над перекладиной, см. ui/Ball.tsx). */
export const GOAL_LANDMARKS = {
  postLeft: { x: 41.2, y: fromArtY(50) },
  postRight: { x: 85.0, y: fromArtY(50) },
  crossbarCenter: { x: 63.0, y: fromArtY(33.3) },
  overBar: { x: 63.0, y: fromArtY(14) },
  groundY: fromArtY(70.2),
};

/** Точка, где стоит вратарь — по центру ворот, ступни на линии газона в воротах. */
export const KEEPER_SPOT = { x: 63.0, y: GOAL_LANDMARKS.groundY - 15 };

/** Точка, где стоит нападающий — ближний план, ступни на траве перед воротами. */
export const STRIKER_SPOT = { x: 22, y: 68 };

/** Позиция кнопки зоны на сцене — просто центр зоны, без искажений. */
export function zoneButtonPosition(zone: ZoneId) {
  const point = ZONE_POINT[zone];
  return { left: `${point.x}%`, top: `${point.y}%` };
}
