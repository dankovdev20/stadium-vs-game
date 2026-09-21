import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface GameButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger" | "striker" | "keeper" | "terminal";
  size?: "md" | "lg" | "zone";
  /** "Выбрано" — золотой outline + лёгкий пульс. Используется зонами удара/защиты. */
  selected?: boolean;
}

// Единая тач-кнопка проекта — используют ВСЕ кнопки игры, от "Zacznij grę" до
// квадратных зон удара/защиты на арене (см. screens/GameScreen/ui/PenaltyScene) —
// та же rounded-2xl-плитка и то же нижнее "ребро" тени, что и у всех остальных
// кнопок, просто крупнее и с цифрой вместо текста. 3D-эффект — тень снизу +
// motion whileTap (уезжает вниз на высоту тени и чуть высветляется), без
// hover — на планшетах-киосках кликают пальцем.
export default function GameButton({
  children,
  icon: Icon,
  variant = "primary",
  size = "lg",
  selected = false,
  className = "",
  disabled,
  ...props
}: GameButtonProps) {
  const isZone = size === "zone";

  const baseStyles =
    "relative flex items-center justify-center rounded-2xl border-0 font-[Poppins] font-bold text-[var(--color-ink-900)] select-none cursor-pointer [touch-action:manipulation] disabled:cursor-not-allowed disabled:grayscale-[.6] disabled:brightness-[.7] disabled:opacity-60";

  // Ширина/цвет нижнего "ребра" 3D-тени — своя на вариант, как было исторически.
  const variantStyles = {
    primary:
      "bg-[var(--color-gold-500)] border-b-[7px] border-[var(--color-gold-700)] active:translate-y-[4px] active:border-b-[2px]",
    secondary:
      "bg-[var(--color-cream-100)] border-b-[5px] border-[var(--color-cream-300)] active:translate-y-[3px] active:border-b-[2px]",
    danger:
      "bg-[var(--color-danger-500)] text-white border-b-[7px] border-[var(--color-danger-700)] active:translate-y-[4px] active:border-b-[2px]",
    terminal:
      "min-h-16 rounded-none border-2 border-b-[7px] border-[#8eaf96] border-b-[#1e472d] bg-[#163d27] px-8 font-['Press_Start_2P'] text-sm !text-[#d7e9dc] shadow-[0_0_18px_rgba(142,175,150,0.12)] active:translate-y-1 active:border-b-2 active:border-[#d7e9dc] active:border-b-[#8eaf96] sm:min-h-20 sm:px-12 sm:text-base",
    // Роли на арене: атака — красный, защита — синий (те же токены, что и везде в проекте).
    striker: "bg-[var(--color-danger-500)] text-white border-[var(--color-danger-700)] border-b-[8px]",
    keeper: "bg-[var(--color-sky-500)] text-white border-[var(--color-sky-700)] border-b-[8px]",
  };

  const shapeStyles = isZone ? "flex-col gap-0" : "gap-3";

  const sizeStyles = {
    md: "min-h-[var(--size-tap-min)] px-6 py-2.5 text-lg",
    lg: "min-h-[var(--size-tap-min)] px-12 py-4 text-2xl",
    // cqh — растёт вместе с ареной (см. PenaltyScene, [container-type:size]),
    // а не фиксированный px: на арене зона обязана масштабироваться как
    // часть сцены, иначе разъедется с воротами на другом экране.
    zone: "h-[16cqh] w-[16cqh] min-h-[76px] min-w-[76px] text-[4cqh]",
  } as const;

  const iconSize = size === "md" ? 20 : 26;

  // Outline (не box-shadow/border) — независимое CSS-свойство, ложится поверх
  // формы и цвета варианта без борьбы за порядок классов в className.
  const selectedStyles = selected ? "outline outline-[0.4em] outline-offset-2 outline-[var(--color-gold-500)] brightness-110 saturate-125" : "";

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onContextMenu={(event) => event.preventDefault()}
      initial={false}
      animate={{ scale: selected ? [1, 1.06, 1] : 1 }}
      whileTap={disabled ? undefined : { y: isZone ? 6 : 4, filter: "brightness(1.2)" }}
      transition={{ duration: 0.26, ease: [0.2, 1.5, 0.4, 1] }}
      className={`${baseStyles} ${shapeStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${selectedStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.5} />}
      {isZone ? children : <span>{children}</span>}
    </motion.button>
  );
}

// Как использовать:
// <GameButton onClick={onPlay} icon={CircleDot} aria-label="Graj">
//   Zacznij grę
// </GameButton>
//
// Квадратная зона на арене:
// <GameButton size="zone" variant="striker" selected={myZone === 1} onClick={...}>
//   <span className="text-[4.6cqh] leading-none">1</span>
//   <span className="text-[1.6cqh] font-normal tracking-[0.1em] opacity-90">2 PKT</span>
// </GameButton>
