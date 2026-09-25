import GameButton from "../../../components/ui/Button";
import type { CharacterOption } from "../model/options";
import PartTilePreview from "../svg/PartTilePreview";

export type BuilderCategory = "head" | "body" | "legs";

const TABS: { key: BuilderCategory; label: string }[] = [
  { key: "head", label: "Głowa" },
  { key: "body", label: "Korpus" },
  { key: "legs", label: "Nogi" },
];

interface CategoryTabsProps {
  active: BuilderCategory;
  onChange: (category: BuilderCategory) => void;
  /** Что сейчас надето в каждой категории — вкладка показывает превью этой детали. */
  worn: Record<BuilderCategory, CharacterOption>;
}

// Переключатель категорий гардероба. На вкладке не только слово, но и
// превью уже надетой детали — ребёнок видит "что у меня сейчас", даже не
// читая подпись.
export default function CategoryTabs({ active, onChange, worn }: CategoryTabsProps) {
  return (
    <div className="flex gap-6">
      {TABS.map((tab) => (
        <GameButton
          key={tab.key}
          size="md"
          variant={active === tab.key ? "primary" : "secondary"}
          aria-pressed={active === tab.key}
          onClick={() => onChange(tab.key)}
          className="h-[136px] flex-1 flex-col gap-0.5 px-2 pb-2.5 text-[28px]"
        >
          <PartTilePreview category={tab.key} option={worn[tab.key]} className="h-[78px] w-[78px]" />
          {tab.label}
        </GameButton>
      ))}
    </div>
  );
}
