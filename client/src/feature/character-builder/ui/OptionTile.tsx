import { motion } from "motion/react";
import type { CharacterOption } from "../model/options";
import type { BuilderCategory } from "./CategoryTabs";
import PartTilePreview from "../svg/PartTilePreview";
import Badge from "../../../components/ui/Badge";

interface OptionTileProps {
  category: BuilderCategory;
  option: CharacterOption;
  selected: boolean;
  onSelect: () => void;
}

// Крупная карточка-превью варианта (взамен старого 80x80 OptionCard):
// показывает саму часть силуэта, а не иконку-плейсхолдер. Тап даёт
// пружинистый отклик (та же bounce-bezier, что у ZoneButton), выбранный
// вариант помечен плашкой "Założone" — читается как "надето", а не просто
// "выбрано".
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
      className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-b-[5px] px-3 py-4 transition-colors duration-100 active:border-b-[2px] ${
        selected
          ? "border-[var(--color-gold-700)] bg-white/15 ring-4 ring-[var(--color-gold-500)]"
          : "border-black/30 bg-white/5"
      }`}
    >
      {selected && (
        <Badge tone="gold" className="absolute -top-3 right-2 px-2 py-0.5 text-[10px] shadow">
          Założone
        </Badge>
      )}
      <div className="h-28 w-28">
        <PartTilePreview category={category} option={option} className="h-full w-full" />
      </div>
      <p className="font-[Poppins] text-base font-bold text-white">{option.label}</p>
      {option.tagline && <p className="font-[Poppins] text-xs leading-tight text-white/60">{option.tagline}</p>}
    </motion.button>
  );
}
