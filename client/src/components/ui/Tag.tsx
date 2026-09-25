import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "gold" | "paper" | "coral" | "azure" | "grass" | "dashed";
  size?: "sm" | "md";
}

const TONE_STYLES: Record<NonNullable<TagProps["tone"]>, string> = {
  gold: "pix-frame surface-gold",
  paper: "pix-frame surface-paper",
  coral: "pix-frame surface-coral",
  azure: "pix-frame surface-azure",
  grass: "pix-frame surface-grass",
  // "Ждём" — пунктир без заливки: читается как пустое место, которое ещё займут.
  dashed: "outline-4 -outline-offset-4 outline-dashed outline-ink-500 text-ink-500",
};

const SIZE_STYLES = {
  sm: "gap-2 px-2.5 pb-2 pt-1.5 text-[20px]",
  md: "gap-2.5 px-4 pb-3 pt-2.5 text-[26px]",
} as const;

// Пиксельная метка — игрок ("GRACZ 1"), роль, готовность, "TO TY".
// Заменила скруглённый Badge: у меток та же рамка чернилами, что у кнопок,
// но плоская (без ступени) и с короткой тенью.
export default function Tag({ children, tone = "paper", size = "md", className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap font-ui font-bold leading-none text-ink [--px-drop:6px]",
        TONE_STYLES[tone],
        SIZE_STYLES[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
