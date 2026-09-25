import manifest from "../../../assets/characters/manifest.json";

// Спрайты персонажей (Universal LPC), собранные scripts/characters/build-characters.mjs
// в src/assets/characters: base/<anim>.png — голое тело, <part>/<id>/<anim>.png —
// вещи варианта, <anim>.back.png — часть варианта ЗА телом (длинные волосы).
// Здесь только адреса и геометрия; рисует ui/PixelSprite.

export type PartKey = "head" | "body" | "legs";
export type AnimName = keyof typeof manifest.animations;
export type Direction = "up" | "left" | "down" | "right";

export const FRAME = manifest.frameSize;
export const PART_ORDER = manifest.partOrder as PartKey[];

/**
 * Геометрия персонажа в кадре 64×64 (замерено по base + голове, кадр idle
 * "вниз"): стопы на строке 62, центр по X — 32, рост 47px (корона — до 0).
 */
export const FEET = { x: 32, y: 62 };

export function animInfo(anim: AnimName) {
  return manifest.animations[anim];
}

/** Строка листа для направления; у одно-рядных анимаций (hurt) всегда 0. */
export function rowFor(anim: AnimName, direction: Direction) {
  return animInfo(anim).rows === 1 ? 0 : manifest.directions.indexOf(direction);
}

const files = import.meta.glob<string>("../../../assets/characters/**/*.png", { eager: true, import: "default" });

const urls = new Map<string, string>();
for (const [path, url] of Object.entries(files)) {
  urls.set(path.replace(/^.*\/assets\/characters\//, ""), url);
}

export function baseUrl(anim: AnimName) {
  return urls.get(`base/${anim}.png`);
}

export function partUrl(part: PartKey, id: number, anim: AnimName, back = false) {
  return urls.get(`${part}/${id}/${anim}${back ? ".back" : ""}.png`);
}

export function partIds(part: PartKey) {
  return manifest.parts[part];
}

// Все листы (~2 МБ, локально) грузим сразу при старте приложения: иначе
// первый кадр персонажа на поле мог бы мигнуть пустотой, пока догружается
// нужный лист. Ссылки держим в массиве, чтобы загрузку не отменил GC.
const preloaded: HTMLImageElement[] = [];
if (typeof window !== "undefined") {
  for (const url of urls.values()) {
    const img = new Image();
    img.src = url;
    preloaded.push(img);
  }
}
