import { motion } from "motion/react";
import type { CharacterSelection } from "../../../game/types";
import type { CharacterOption } from "../model/options";
import type { BuilderCategory } from "./CategoryTabs";
import OptionTile from "./OptionTile";

interface OptionGridProps {
  category: BuilderCategory;
  options: CharacterOption[];
  outfit: CharacterSelection;
  selectedId: number;
  onSelect: (id: number) => void;
  disabled?: boolean;
}

// Сетка 3×2 карточек активной категории. Смена вкладки — новая сетка
// появляется СРАЗУ с коротким fade+slide (key на категории). Раньше старая
// сетка сначала доигрывала исчезновение (AnimatePresence mode="wait") — тап
// по вкладке откликался только через ~0.5с, для ребёнка это "не нажалось".
export default function OptionGrid({ category, options, outfit, selectedId, onSelect, disabled = false }: OptionGridProps) {
  return (
    <motion.div
      key={category}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12 }}
      className="grid grid-cols-3 gap-x-6 gap-y-6"
    >
      {options.map((option) => (
        <OptionTile
          key={option.id}
          category={category}
          option={option}
          outfit={outfit}
          selected={selectedId === option.id}
          disabled={disabled}
          onSelect={() => !disabled && onSelect(option.id)}
        />
      ))}
    </motion.div>
  );
}
