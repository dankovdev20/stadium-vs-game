import type { MouseEvent } from "react";
import { motion } from "motion/react";
import type { ZoneId } from "../model/zones";

export type ZoneRole = "striker" | "keeper";

export interface ZoneButtonProps {
  zone: ZoneId;
  label: string;
  points: 1 | 2;
  role: ZoneRole;
  selected?: boolean;
  disabled?: boolean;
  floating?: boolean;
  onClick: (zone: ZoneId) => void;
}

const ACTION_WORD: Record<ZoneRole, string> = { striker: "Strzał w strefę", keeper: "Obrona strefy" };

export default function ZoneButton({ zone, label, points, role, selected = false, disabled = false, floating = false, onClick }: ZoneButtonProps) {
  const isLocked = disabled || selected;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isLocked) onClick(zone);
  };
  const roleClass = role === "striker" ? "bg-[#e0232a] border-b-[6px] border-[#7f1010]" : "bg-[#2554e8] border-b-[6px] border-[#10225f]";
  const selectedClass = selected ? "shadow-[0_0_0_4px_#ffd60a,0_8px_0_rgba(0,0,0,0.6)] brightness-115 saturate-125" : "";

  return (
    <motion.button
      type="button"
      disabled={isLocked}
      aria-pressed={selected}
      aria-label={`${ACTION_WORD[role]} ${zone}: ${label}, ${points} pkt`}
      data-testid={`zone-button-${zone}`}
      data-zone={zone}
      data-role={role}
      data-selected={selected ? "true" : "false"}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
      initial={false}
      animate={{ scale: selected ? [1, 1.06, 1] : 1 }}
      whileTap={{ y: 6, filter: "brightness(1.25)" }}
      transition={{ duration: 0.26, ease: [0.2, 1.5, 0.4, 1] }}
      className={`${floating ? "flex h-[clamp(58px,7vw,108px)] w-[clamp(58px,7vw,108px)] min-w-0 rounded-full" : "min-h-[clamp(64px,9vh,150px)] min-w-16 flex-1 rounded-2xl"} relative flex cursor-pointer select-none flex-col items-center justify-center gap-[0.15em] border-0 px-1 py-[clamp(0.3rem,1vh,0.9rem)] font-['Anton'] text-center text-white shadow-[0_0_0_4px_#04070d,0_8px_0_rgba(0,0,0,0.6)] transition-all duration-100 [touch-action:manipulation] [-webkit-tap-highlight-color:transparent] active:translate-y-[4px] active:border-b-[2px] active:brightness-125 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[.75] disabled:brightness-[.55] ${roleClass} ${selectedClass}`}
    >
      <span className="text-[clamp(1.1rem,2.6vw,2.8rem)] leading-none text-[#ffd60a] [text-shadow:0_3px_0_rgba(0,0,0,0.55)]" aria-hidden="true">{zone}</span>
      {!floating && <span className="text-[clamp(0.65rem,1.3vw,1.3rem)] leading-[1.05] tracking-[0.06em] uppercase [overflow-wrap:anywhere]">{label}</span>}
      {!floating && <span className="bg-black/45 px-[0.5em] py-[0.05em] text-[clamp(0.55rem,0.95vw,0.95rem)] tracking-[0.18em]" aria-hidden="true">{points} PKT</span>}
    </motion.button>
  );
}
