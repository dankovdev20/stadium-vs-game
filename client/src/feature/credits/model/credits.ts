import lpcCredits from "../../../assets/characters/credits.json";

// Данные окна "Autorzy" (лобби → кнопка в правом нижнем углу). Меняем
// только этот файл: окно (ui/CreditsDialog) просто рисует то, что здесь.

export interface CreditPerson {
  name: string;
  role: string;
}

export interface CreditAsset {
  /** Что именно: "Czcionka Jersey 10", "Postacie (LPC)" и т.п. */
  work: string;
  authors: string;
  license?: string;
}

/**
 * Разработчики стенда. Сейчас стоят ники из истории git — замените на
 * настоящие имена и роли, как они должны звучать на стенде.
 */
export const DEVELOPERS: CreditPerson[] = [
  { name: "Daniil Ilin", role: "Programowanie, grafika" },
  { name: "Danyil Chernenko", role: "Programowanie" },
  // { name: "cra1zer2", role: "Programowanie" }, :(
];

/** Чужие ассеты, которые требуют или заслуживают указания авторства. */
export const ASSET_CREDITS: CreditAsset[] = [
  { work: "Czcionka Jersey 10", authors: "Sarah Cadigan-Fried", license: "SIL Open Font License 1.1" },
  { work: "Czcionka Pixelify Sans", authors: "Stefie Justprince", license: "SIL Open Font License 1.1" },
];

/**
 * Авторы спрайтов персонажей (Universal LPC). credits.json генерирует
 * scripts/characters/build-characters.mjs вместе с самими спрайтами — при
 * смене вещей в конструкторе список обновляется сам, руками не правим.
 */
export const CHARACTER_ART = {
  work: "Postacie: Universal LPC Spritesheet (Liberated Pixel Cup)",
  source: "opengameart.org",
  authors: [...new Set(lpcCredits.flatMap((entry) => entry.authors))].sort((a, b) => a.localeCompare(b)),
  licenses: [...new Set(lpcCredits.flatMap((entry) => entry.licenses))].sort(),
};
