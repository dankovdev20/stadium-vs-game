import type { MouseEvent } from "react";
import { motion } from "motion/react";
import type { ZoneId } from "../model/zoneLayout";

export type ZoneRole = "striker" | "keeper";

export interface ZoneButtonProps {
  zone: ZoneId;
  points: 1 | 2;
  role: ZoneRole;
  selected?: boolean;
  disabled?: boolean;
  onClick: (zone: ZoneId) => void;
}

// Плавающая круглая кнопка зоны прямо на сцене — не components/ui/Button
// (у той нет floating-варианта и своей микро-анимации тапа), но цвета те
// же токены проекта: атака — danger (красный), защита — sky (синий).
export default function ZoneButton({ zone, points, role, selected = false, disabled = false, onClick }: ZoneButtonProps) {
  const isLocked = disabled || selected;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isLocked) onClick(zone);
  };
  const roleClass =
    role === "striker"
      ? "bg-[var(--color-danger-500)] border-b-[6px] border-[var(--color-danger-700)]"
      : "bg-[var(--color-sky-500)] border-b-[6px] border-[var(--color-sky-700)]";

  return (
    <motion.button
      type="button"
      disabled={isLocked}
      aria-pressed={selected}
      aria-label={`Zona ${zone}, ${points} pkt`}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
      initial={false}
      animate={{ scale: selected ? [1, 1.06, 1] : 1 }}
      whileTap={{ y: 6, filter: "brightness(1.25)" }}
      transition={{ duration: 0.26, ease: [0.2, 1.5, 0.4, 1] }}
      className={`relative flex h-20 w-20 min-w-0 cursor-pointer select-none flex-col items-center justify-center gap-0.5 rounded-full border-0 font-[Anton] text-white shadow-[0_0_0_4px_#04070d,0_8px_0_rgba(0,0,0,0.6)] transition-all duration-100 [touch-action:manipulation] active:translate-y-[4px] active:border-b-[2px] active:brightness-125 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[.75] disabled:brightness-[.55] ${roleClass} ${
        selected ? "shadow-[0_0_0_4px_var(--color-gold-500),0_8px_0_rgba(0,0,0,0.6)] brightness-115 saturate-125" : ""
      }`}
    >
      <span className="text-2xl leading-none text-[var(--color-gold-500)] [text-shadow:0_2px_0_rgba(0,0,0,0.55)]">{zone}</span>
      <span className="bg-black/45 px-1.5 text-[10px] tracking-[0.15em]">{points} PKT</span>
    </motion.button>
  );
}
