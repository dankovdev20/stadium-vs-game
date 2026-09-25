export interface CharacterOption {
  id: number;
  label: string;
  /** Какую SVG-геометрию рисовать для этой опции (см. ../svg/parts/*). */
  variant: string;
  /** Значения подставляются как CSS-переменные --part-primary/--part-accent/--part-metal. */
  palette: { primary: string; accent: string; metal?: string };
  tagline?: string;
  /**
   * Заготовка под пиксель-арт вместо SVG. PNG-слой этой части на ПОЛНЫЙ
   * кадр персонажа (прозрачный фон, один и тот же холст у всех частей —
   * слои просто кладутся друг на друга: ноги → корпус → голова). Холст
   * держим в пропорции кадра 200×322 (например 50×80 px арта), рисуется с
   * image-rendering: pixelated. Пока у ЛЮБОЙ из трёх выбранных частей нет
   * sprite — персонаж рисуется старым SVG (см. ui/CharacterSprite).
   */
  sprite?: string;
  /** PNG для карточки гардероба (только сама деталь). Нет — карточка рисует SVG-превью. */
  thumb?: string;
}

// Głowa: "primary" — цвет волос, "accent" — цвет причёски/аксессуара.
export const HEAD_OPTIONS: CharacterOption[] = [
  { id: 1, label: "Bandana", variant: "bandana", palette: { primary: "#5b3a29", accent: "#e5484d" }, tagline: "Gotowy do gry" },
  { id: 2, label: "Czapka", variant: "cap", palette: { primary: "#e8c07d", accent: "#2d7dd2" }, tagline: "Styl kapitana" },
  { id: 3, label: "Loki", variant: "curls", palette: { primary: "#d97a3d", accent: "#f0a868" }, tagline: "Fryzura z charakterem" },
  { id: 4, label: "Kucyk", variant: "ponytail", palette: { primary: "#2b2320", accent: "#ff6f91" }, tagline: "Szybka jak wiatr" },
  { id: 5, label: "Irokez", variant: "mohawk", palette: { primary: "#40916c", accent: "#6fbf8b" }, tagline: "Odważny wybór" },
  { id: 6, label: "Korona", variant: "crown", palette: { primary: "#ffc93c", accent: "#2d7dd2" }, tagline: "Król boiska" },
];

// Korpus: "primary" — цвет джерси, "accent" — цвет отделки/эмблемы.
export const BODY_OPTIONS: CharacterOption[] = [
  { id: 1, label: "Odznaka", variant: "badge", palette: { primary: "#2d7dd2", accent: "#ffd166" }, tagline: "Klasyczna koszulka" },
  { id: 2, label: "Szarfa", variant: "sash", palette: { primary: "#f1efe7", accent: "#e5484d", metal: "#7a6a55" }, tagline: "Przez pierś na ukos" },
  { id: 3, label: "Opaska", variant: "armband", palette: { primary: "#1b4332", accent: "#ffc93c" }, tagline: "Kapitan drużyny" },
  { id: 4, label: "Manishka", variant: "vest", palette: { primary: "#c9c4b4", accent: "#f2994a", metal: "#7a6a55" }, tagline: "Trening przed meczem" },
  { id: 5, label: "Gwiazda", variant: "star", palette: { primary: "#1c5a9c", accent: "#ffd166" }, tagline: "Gwiazda boiska" },
  { id: 6, label: "Bramkarska", variant: "keeper", palette: { primary: "#ffc93c", accent: "#2b2320" }, tagline: "Broni jak mur" },
];

// Nogi: "primary" — цвет шорт, "accent" — цвет гольфов/окантовки бутс.
export const LEGS_OPTIONS: CharacterOption[] = [
  { id: 1, label: "Korki", variant: "cleats", palette: { primary: "#2b2320", accent: "#f1efe7" }, tagline: "Pewny krok" },
  { id: 2, label: "Rakietowe", variant: "rocket", palette: { primary: "#e5484d", accent: "#ffd166" }, tagline: "Odrzutowy start" },
  { id: 3, label: "Rolki", variant: "rollers", palette: { primary: "#2d7dd2", accent: "#c9c4b4" }, tagline: "Płynny poślizg" },
  { id: 4, label: "Sprężynowe", variant: "springs", palette: { primary: "#40916c", accent: "#ffc93c" }, tagline: "Wysoki wyskok" },
  { id: 5, label: "Wysokie", variant: "hightops", palette: { primary: "#7c5cbf", accent: "#ff6f91" }, tagline: "Wysoki styl" },
  { id: 6, label: "Turbo", variant: "turbo", palette: { primary: "#5b6472", accent: "#e5484d" }, tagline: "Moc turbiny" },
];

// Переиспользуется везде, где по id из CharacterSelection нужно достать
// опцию варианта: конструктор персонажа и CharacterSprite на игровом поле
// (screens/GameScreen/ui) — единственное место с этой логикой.
export function getOptionById(options: CharacterOption[], id: number): CharacterOption {
  return options.find((o) => o.id === id) ?? options[0];
}
