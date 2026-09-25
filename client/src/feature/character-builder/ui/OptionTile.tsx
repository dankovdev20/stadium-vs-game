import { motion } from "motion/react";
import type { CharacterOption } from "../model/options";
import type { BuilderCategory } from "./CategoryTabs";
import PartTilePreview from "../svg/PartTilePreview";

interface OptionTileProps {
  category: BuilderCategory;
  option: CharacterOption;
  selected: boolean;
  onSelect: () => void;
}

// Крупная карточка-превью варианта: показывает саму часть силуэта, а не
// иконку-плейсхолдер. Тап даёт пружинистый отклик (та же bounce-bezier,
// что у GameButton), выбранный вариант помечен плашкой "Założone".
//
// Терминальная палитра/шрифт вместо rounded-2xl gold — плашка "Założone"
// теперь пиксельный бейдж на месте прежнего Badge, чтобы не тянуть
// gold-стилистику отдельного компонента.
export default function OptionTile({ category, option, selected, onSelect }: OptionTileProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={option.label}
      whileTap={{ y: 4, filter: "brightness(1.15)" }}
      animate={{ scale: selected ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.25, ease: [0.2, 1.5, 0.4, 1] }}
      className={`relative flex flex-col items-center justify-center gap-1.5 border-2 border-b-4 px-3 py-4 transition-all duration-100 active:translate-y-1 active:border-b-2 ${
        selected
          ? "border-[#d7e9dc] border-b-[#a5c7ae] bg-[#173b2b] shadow-[0_0_16px_rgba(215,233,220,0.25)]"
          : "border-[#587a63]/70 border-b-[#2c4a36] bg-[#0b2418]"
      }`}
    >
      {selected && (
        <span className="absolute -top-3 right-2 border-2 border-[#d7e9dc] bg-[#173b2b] px-2 py-0.5 font-['Press_Start_2P'] text-[8px] uppercase leading-relaxed tracking-normal text-[#d7e9dc] shadow-[2px_2px_0_rgba(0,0,0,0.4)]">
          Założone
        </span>
      )}
      <div className="h-24 w-24">
        <PartTilePreview category={category} option={option} className="h-full w-full" />
      </div>
      <p className="font-['Press_Start_2P'] text-[10px] uppercase leading-relaxed tracking-normal text-[#d7e9dc] sm:text-xs">{option.label}</p>
      {option.tagline && (
        <p className="font-['Press_Start_2P'] text-[8px] uppercase leading-relaxed tracking-normal text-[#8eaf96]">{option.tagline}</p>
      )}
    </motion.button>
  );
}