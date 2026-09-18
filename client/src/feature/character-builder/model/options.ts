import { Crown, Glasses, Star, Ghost, Shirt, Shield, Flame, Gem, Footprints, Rocket, Wind, Zap, type LucideIcon } from "lucide-react";

export interface CharacterOption {
  id: number;
  label: string;
  colorClass: string;
  icon: LucideIcon;
  /**
   * Точка замены заглушки на реальный арт: если задано, OptionCard и
   * PreviewStack подставляют <img src={imageUrl}> вместо цветной плашки
   * с иконкой — остальной код конструктора не меняется.
   */
  imageUrl?: string;
}

export const HEAD_OPTIONS: CharacterOption[] = [
  { id: 1, label: "Korona", colorClass: "bg-[var(--color-gold-500)]", icon: Crown },
  { id: 2, label: "Okulary", colorClass: "bg-[var(--color-sky-500)]", icon: Glasses },
  { id: 3, label: "Gwiazda", colorClass: "bg-[var(--color-danger-500)]", icon: Star },
  { id: 4, label: "Duch", colorClass: "bg-[var(--color-grass-300)]", icon: Ghost },
];

export const BODY_OPTIONS: CharacterOption[] = [
  { id: 1, label: "Koszulka", colorClass: "bg-[var(--color-sky-500)]", icon: Shirt },
  { id: 2, label: "Tarcza", colorClass: "bg-[var(--color-gold-500)]", icon: Shield },
  { id: 3, label: "Płomień", colorClass: "bg-[var(--color-danger-500)]", icon: Flame },
  { id: 4, label: "Kryształ", colorClass: "bg-[var(--color-grass-300)]", icon: Gem },
];

export const LEGS_OPTIONS: CharacterOption[] = [
  { id: 1, label: "Kroki", colorClass: "bg-[var(--color-grass-300)]", icon: Footprints },
  { id: 2, label: "Rakieta", colorClass: "bg-[var(--color-gold-500)]", icon: Rocket },
  { id: 3, label: "Wiatr", colorClass: "bg-[var(--color-sky-500)]", icon: Wind },
  { id: 4, label: "Błyskawica", colorClass: "bg-[var(--color-danger-500)]", icon: Zap },
];

// Переиспользуется везде, где по id из CharacterSelection нужно достать
// иконку/цвет варианта: PreviewStack в конструкторе и CharacterSprite на
// игровом поле (screens/GameScreen/ui) — единственное место с этой логикой.
export function getOptionById(options: CharacterOption[], id: number): CharacterOption {
  return options.find((o) => o.id === id) ?? options[0];
}
