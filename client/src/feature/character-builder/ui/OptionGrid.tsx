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

// Сетка 3×2 карточек активной категории. Смена вкладки — лёгкий
// fade+slide (без пружины: переключение вкладок должно ощущаться быстрым,
// в отличие от самого выбора варианта в OptionTile).
export default function OptionGrid({ category, options, selectedId, onSelect, disabled = false }: OptionGridProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="grid grid-cols-3 gap-x-6 gap-y-6"
      >
        {options.map((option) => (
          <OptionTile
            key={option.id}
            category={category}
            option={option}
            selected={selectedId === option.id}
            disabled={disabled}
            onSelect={() => !disabled && onSelect(option.id)}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
