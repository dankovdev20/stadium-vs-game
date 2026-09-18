import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger";
  size?: "md" | "lg" | "zone";
}

// Универсальная тач-кнопка проекта: 3D через тень + active:translate-y,
// без hover — на планшетах-киосках кликают пальцем, наведения не бывает.
export default function GameButton({
  children,
  icon: Icon,
  variant = "primary",
  size = "lg",
  className = "",
  ...props
}: GameButtonProps) {
  const baseStyles =
    "flex items-center justify-center gap-3 font-[Poppins] font-bold text-[var(--color-ink-900)] rounded-2xl transition-all duration-100 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[var(--color-gold-500)] border-b-[7px] border-[var(--color-gold-700)] active:translate-y-[4px] active:border-b-[2px]",
    secondary:
      "bg-[var(--color-cream-100)] border-b-[5px] border-[var(--color-cream-300)] active:translate-y-[3px] active:border-b-[2px]",
    danger:
      "bg-[var(--color-danger-500)] text-white border-b-[7px] border-[var(--color-danger-700)] active:translate-y-[4px] active:border-b-[2px]",
  };

  const sizeStyles = {
    md: "min-h-[var(--size-tap-min)] px-6 py-2.5 text-lg",
    lg: "min-h-[var(--size-tap-min)] px-12 py-4 text-2xl",
    // Квадратный тач-таргет под зоны удара/защиты (мастер-спека: не менее 64x64px).
    zone: "h-20 w-20 text-3xl",
  };

  const iconSize = size === "md" ? 20 : 26;

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.5} />}
      <span>{children}</span>
    </button>
  );
}

// Как использовать:
// <GameButton onClick={onPlay} icon={CircleDot} aria-label="Graj">
//   Zacznij grę
// </GameButton>
