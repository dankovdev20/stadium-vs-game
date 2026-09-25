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
//
// Вкладки-кнопки в терминальной палитре (border-b "ребро" + active
// translate, как у слотов LobbyScreen), а не GameButton primary/secondary —
// под общий пиксельный стиль экрана.
export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex-1 border-2 border-b-4 px-2 py-3 font-['Press_Start_2P'] text-[10px] uppercase leading-relaxed tracking-normal transition-all duration-100 active:translate-y-1 active:border-b-2 sm:text-xs ${
              isActive
                ? "border-[#d7e9dc] border-b-[#a5c7ae] bg-[#d7e9dc] text-[#173b2b]"
                : "border-[#587a63] border-b-[#2c4a36] bg-[#0b2418] text-[#b8d0bc]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}