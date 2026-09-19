import { type HTMLAttributes, type ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: "dark" | "light";
}

// Карточка со скруглением/тенью — паттерн, изначально сверстанный в
// StartScreen для титульного блока, вынесен сюда для переиспользования
// (HUD, конструктор персонажа, результаты раунда).
export default function Panel({ children, tone = "dark", className = "", ...props }: PanelProps) {
  const toneStyles =
    tone === "dark"
      ? "border border-white/10 bg-black/20 text-white backdrop-blur-xs"
      : "border border-black/5 bg-[var(--color-cream-100)] text-[var(--color-ink-900)]";

  return (
    <div className={`rounded-3xl shadow-2xl ${toneStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
