import Panel from "../../../components/ui/Panel";
import type { CharacterOption } from "../model/options";
import OptionCard from "./OptionCard";

interface CategoryColumnProps {
  title: string;
  options: CharacterOption[];
  selectedId: number;
  onSelect: (id: number) => void;
  disabled?: boolean;
}

// Узкая вертикальная колонка одной категории (Głowa/Korpus/Nogi). Три такие
// колонки стоят рядом слева экрана (см. CharacterBuilder) — под фиксированные
// 1920×1080 без прокрутки: колонки узкие и горизонтальные между собой,
// варианты внутри — вертикальным списком.
export default function CategoryColumn({ title, options, selectedId, onSelect, disabled = false }: CategoryColumnProps) {
  return (
    <Panel tone="dark" className="flex h-full w-36 flex-col items-center gap-3 px-3 py-4">
      <p className="text-center font-[Poppins] text-xs font-bold uppercase tracking-widest text-white/70">{title}</p>
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        {options.map((option) => (
          <OptionCard key={option.id} option={option} selected={selectedId === option.id} onSelect={() => !disabled && onSelect(option.id)} />
        ))}
      </div>
    </Panel>
  );
}
