import { twMerge } from "tailwind-merge";

type ClassValue = string | false | null | undefined;

// Склейка классов с разрешением конфликтов Tailwind: className, переданный
// снаружи, всегда побеждает базовый класс компонента (раньше `text-base`
// снаружи против `text-lg` внутри GameButton решал порядок в CSS-бандле).
export function cn(...classes: ClassValue[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}
