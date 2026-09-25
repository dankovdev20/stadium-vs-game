import { partIds, type PartKey } from "./sprites";

export interface CharacterOption {
  id: number;
  label: string;
  tagline?: string;
}

// Варианты конструктора — из манифеста спрайтов (его генерирует
// scripts/characters/build-characters.mjs по characters.config.json).
// Названия и подписи правим в конфиге, а не здесь.
function optionsFor(part: PartKey): CharacterOption[] {
  return partIds(part).map(({ id, label, tagline }) => ({ id, label, tagline }));
}

export const HEAD_OPTIONS = optionsFor("head");
export const BODY_OPTIONS = optionsFor("body");
export const LEGS_OPTIONS = optionsFor("legs");

// Переиспользуется везде, где по id из CharacterSelection нужно достать
// опцию варианта: конструктор персонажа и сцена матча — единственное место
// с этой логикой. Незнакомый id (старый клиент/сервер) — первый вариант.
export function getOptionById(options: CharacterOption[], id: number): CharacterOption {
  return options.find((o) => o.id === id) ?? options[0];
}
