import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "./cn";
import PixelIcon from "./PixelIcon";

interface GameButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  children: ReactNode;
  /** Иконка слева от текста — обычно <PixelIcon />. */
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "success" | "striker" | "keeper";
  size?: "md" | "lg" | "zone";
  /** "Выбрано" — золотая рамка, галочка в углу и короткий пульс. Используют зоны удара/защиты и карточки гардероба. */
  selected?: boolean;
  /** Своя метка в углу выбранной кнопки вместо галочки (например "Założone" в гардеробе); null — без метки. */
  selectedBadge?: ReactNode;
}

const VARIANT_SURFACE = {
  primary: "surface-gold",
  secondary: "surface-paper",
  success: "surface-grass",
  // Роли на арене: атака — коралл, защита — лазурь (тот же язык, что метки ролей в HUD).
  striker: "surface-coral",
  keeper: "surface-azure",
} as const;

const SIZE_STYLES = {
  md: "min-h-[88px] px-9 pb-1 text-[32px] gap-4",
  lg: "min-h-[112px] px-14 pb-1 text-[40px] gap-5",
  // cqh — растёт вместе с ареной (см. PenaltyScene, [container-type:size]):
  // зона обязана масштабироваться как часть сцены, а не жить в своих px.
  zone: "h-[16cqh] w-[16cqh] flex-col gap-0 pb-[0.8cqh]",
} as const;

// Единая тач-кнопка проекта — от "Zagraj ponownie" до квадратных зон
// удара/защиты на арене. Пиксельная рамка чернилами, блик сверху, ступень
// снизу (см. .pix-frame в index.css). Нажатие — CSS (.pix-press): предмет
// опускается на 6px за 80мс. Без hover — на киоске жмут пальцем.
//
// Неактивная кнопка красится в сиреневый surface-mute, а не
// полупрозрачностью: на пастельном фоне полупрозрачная кнопка читается как
// "сломалась". Исключение — выбранная (selected) кнопка: после выбора зоны
// все зоны disabled, но выбранная остаётся в цвете роли, чтобы было видно,
// что именно выбрано.
export default function GameButton({
  children,
  icon,
  variant = "primary",
  size = "lg",
  selected = false,
  selectedBadge,
  className,
  disabled,
  ...props
}: GameButtonProps) {
  const muted = disabled && !selected;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onContextMenu={(event) => event.preventDefault()}
      initial={false}
      animate={{ scale: selected ? [1, 1.06, 1] : 1 }}
      transition={{ duration: 0.26, ease: [0.2, 1.5, 0.4, 1] }}
      className={cn(
        "pix-frame pix-raised pix-press relative flex cursor-pointer select-none items-center justify-center font-ui font-bold leading-none text-ink [touch-action:manipulation] disabled:cursor-not-allowed",
        muted ? "surface-mute" : VARIANT_SURFACE[variant],
        SIZE_STYLES[size],
        selected && "outline-8 outline-offset-8 outline-gold-500",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {selected &&
        selectedBadge !== null &&
        (selectedBadge !== undefined ? (
          <span className="absolute -right-3.5 -top-[26px]" aria-hidden="true">
            {selectedBadge}
          </span>
        ) : (
          <span className="pix-frame surface-gold absolute -right-7 -top-7 grid h-14 w-14 place-items-center" aria-hidden="true">
            <PixelIcon name="check" scale={5} />
          </span>
        ))}
    </motion.button>
  );
}

// Как использовать:
// <GameButton onClick={onPlay} icon={<PixelIcon name="reload" scale={5} />}>
//   Zagraj ponownie
// </GameButton>
//
// Квадратная зона на арене:
// <GameButton size="zone" variant="striker" selected={myZone === 1} onClick={...}>
//   <span className="font-display text-[9.6cqh] leading-[0.8]">1</span>
//   <span className="text-[2.2cqh]">2 PKT</span>
// </GameButton>
