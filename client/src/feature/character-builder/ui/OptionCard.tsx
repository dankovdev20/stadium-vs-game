import type { CharacterOption } from "../model/options";

interface OptionCardProps {
  option: CharacterOption;
  selected: boolean;
  onSelect: () => void;
}

// Тап-таргет 80x80px (выше минимума из спеки), состояние "выбрано" — через
// белую рамку/scale, без hover: на планшете наведения не бывает.
export default function OptionCard({ option, selected, onSelect }: OptionCardProps) {
  const Icon = option.icon;

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={option.label}
      className={`flex h-20 w-20 items-center justify-center rounded-2xl border-b-[5px] transition-all duration-100 active:translate-y-[2px] active:border-b-[2px] ${option.colorClass} ${
        selected ? "border-white ring-4 ring-white scale-105" : "border-black/20"
      }`}
    >
      {option.imageUrl ? (
        <img src={option.imageUrl} alt={option.label} className="h-10 w-10 object-contain" />
      ) : (
        <Icon size={30} strokeWidth={2.5} className="text-[var(--color-ink-900)]" />
      )}
    </button>
  );
}
