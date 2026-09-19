/**
 * Геометрия ворот и зон 1–5 на сцене. Зеркалит таблицу зон из
 * server/src/gameRules.js (названия/очки), но здесь только позиция —
 * игровой логики нет, результат раунда всегда приходит с сервера.
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

/** Рамка ворот на сцене, в процентах от контейнера сцены. */
export const GOAL = { left: 53, top: 8, width: 42, height: 48 };

/** Переводит координаты внутри ворот (0–100) в координаты сцены (%). */
export function toScene(gx: number, gy: number) {
  return {
    x: GOAL.left + (gx * GOAL.width) / 100,
    y: GOAL.top + (gy * GOAL.height) / 100,
  };
}

/** Координаты центра зоны внутри рамки ворот, в процентах (0–100). */
export const ZONE_POINT: Record<ZoneId, { x: number; y: number }> = {
  1: { x: 18, y: 30 },
  2: { x: 50, y: 28 },
  3: { x: 82, y: 30 },
  4: { x: 18, y: 74 },
  5: { x: 82, y: 74 },
};

/** Позиция кнопки зоны на сцене (с небольшим опусканием у правого столба). */
export function zoneButtonPosition(zone: ZoneId) {
  const point = ZONE_POINT[zone];
  const rightSideDrop = zone === 3 || zone === 5 ? 8 : 0;
  const scenePoint = toScene(point.x, point.y);
  return { left: `${scenePoint.x}%`, top: `${scenePoint.y + rightSideDrop}%` };
}
