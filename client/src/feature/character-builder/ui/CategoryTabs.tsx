import GameButton from "../../../components/ui/Button";

export type BuilderCategory = "head" | "body" | "legs";

const TABS: { key: BuilderCategory; label: string }[] = [
  { key: "head", label: "Głowa" },
  { key: "body", label: "Korpus" },
  { key: "legs", label: "Nogi" },
];

interface CategoryTabsProps {
  active: BuilderCategory;
  onChange: (category: BuilderCategory) => void;
}

// Переключатель категорий "примерочной" — заменяет три одновременные
// колонки на один активный раздел, чтобы карточки вариантов внутри могли
// быть крупными (см. OptionTile).
export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <GameButton
          key={tab.key}
          size="md"
          variant={active === tab.key ? "primary" : "secondary"}
          onClick={() => onChange(tab.key)}
          className="flex-1 text-base"
        >
          {tab.label}
        </GameButton>
      ))}
    </div>
  );
}
