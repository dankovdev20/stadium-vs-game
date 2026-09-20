import { motion, AnimatePresence } from "motion/react";
import type { CharacterOption } from "../model/options";
import type { BuilderCategory } from "./CategoryTabs";
import OptionTile from "./OptionTile";

interface OptionGridProps {
  category: BuilderCategory;
  options: CharacterOption[];
  selectedId: number;
  onSelect: (id: number) => void;
  disabled?: boolean;
}

// Сетка карточек активной категории. Смена таба лёгким fade+slide
// (без bounce — переключение вкладок должно ощущаться быстрым, а не
// "пружинистым", в отличие от самого выбора варианта в OptionTile).
export default function OptionGrid({ category, options, selectedId, onSelect, disabled = false }: OptionGridProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="grid flex-1 grid-cols-2 grid-rows-3 gap-4 overflow-y-auto p-2"
      >
        {options.map((option) => (
          <OptionTile
            key={option.id}
            category={category}
            option={option}
            selected={selectedId === option.id}
            onSelect={() => !disabled && onSelect(option.id)}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
