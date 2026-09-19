import { type HTMLAttributes, type ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "gold" | "sky" | "danger" | "neutral";
}

const TONE_STYLES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  gold: "bg-[var(--color-gold-500)] text-[var(--color-ink-900)]",
  sky: "bg-[var(--color-sky-500)] text-white",
  danger: "bg-[var(--color-danger-500)] text-white",
  neutral: "bg-white/15 text-white",
};

// Пилюля для счёта/раунда/статусных сообщений — переиспользуется в HUD и модалках.
export default function Badge({ children, tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-[Poppins] font-bold uppercase tracking-wide ${TONE_STYLES[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
