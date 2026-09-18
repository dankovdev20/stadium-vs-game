/**
 * Зеркало серверной таблицы зон из server/src/gameRules.js.
 * Здесь НЕТ игровой логики — только названия, очки и позиция на сцене.
 * Результат раунда всегда приходит с сервера в round:resolved.
 */

export type ZoneId = 1 | 2 | 3 | 4 | 5;

export interface ZoneDef {
  id: ZoneId;
  /** Польское название зоны (как в gameRules.js) */
  name: string;
  points: 1 | 2;
  isTop: boolean;
  /** Колонка в воротах — используется и сценой, и сеткой кнопок */
  col: "left" | "center" | "right";
}

export const ZONES: readonly ZoneDef[] = [
  { id: 1, name: "Góra-Lewo", points: 2, isTop: true, col: "left" },
  { id: 2, name: "Góra-Środek", points: 2, isTop: true, col: "center" },
  { id: 3, name: "Góra-Prawo", points: 2, isTop: true, col: "right" },
  { id: 4, name: "Dół-Lewo", points: 1, isTop: false, col: "left" },
  { id: 5, name: "Dół-Prawo", points: 1, isTop: false, col: "right" },
] as const;

export const TOP_ZONES = ZONES.filter((z) => z.isTop);
export const BOTTOM_ZONES = ZONES.filter((z) => !z.isTop);

export function getZone(id: number | null | undefined): ZoneDef | null {
  return ZONES.find((z) => z.id === id) ?? null;
}

export function getZoneName(id: number | null | undefined): string {
  return getZone(id)?.name ?? "—";
}

export function isZoneId(value: number): value is ZoneId {
  return value >= 1 && value <= 5 && Number.isInteger(value);
}

/**
 * Координаты центра зоны внутри рамки ворот, в процентах (0–100).
 * Используются сценой для наведения мяча и вратаря.
 */
export const ZONE_POINT: Record<ZoneId, { x: number; y: number }> = {
  1: { x: 18, y: 30 },
  2: { x: 50, y: 28 },
  3: { x: 82, y: 30 },
  4: { x: 18, y: 74 },
  5: { x: 82, y: 74 },
};
