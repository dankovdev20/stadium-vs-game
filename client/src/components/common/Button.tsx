import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
}

export default function GameButton({
  children,
  icon: Icon,
  variant = "primary",
  size = "lg",
  className = "",
  ...props
}: GameButtonProps) {
  const baseStyles =
    "flex items-center justify-center gap-3 font-[Poppins] font-bold text-[#1B4332] rounded-2xl transition-all duration-100 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[#FFC93C] border-b-[7px] border-[#C97F00] active:translate-y-[4px] active:border-b-[2px]",
    secondary:
      "bg-[#F1EFE7] border-b-[5px] border-[#C9C4B4] active:translate-y-[3px] active:border-b-[2px]",
  };

  const sizeStyles = {
    md: "px-6 py-2.5 text-lg",
    lg: "px-12 py-4 text-2xl",
  };

  const iconSize = size === "lg" ? 26 : 20;

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

// Как использовать
{/* Button 
  onClick={onPlay} 
  icon={CircleDot}
  aria-label="Graj"
>
  Zacznij grę
</Button> */}