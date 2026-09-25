import type { CharacterOption } from "../model/options";
import type { BuilderCategory } from "./CategoryTabs";
import PartTilePreview from "../svg/PartTilePreview";
import GameButton from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";

interface OptionTileProps {
  category: BuilderCategory;
  option: CharacterOption;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

// Карточка варианта в гардеробе: крупное превью самой детали, название и
// короткая подпись. Надетый вариант — золотая рамка и метка "Założone"
// ("надето", а не просто "выбрано"). После подтверждения персонажа
// карточки блокируются, надетая остаётся в цвете.
export default function OptionTile({ category, option, selected, disabled = false, onSelect }: OptionTileProps) {
  return (
    <GameButton
      size="md"
      variant="secondary"
      selected={selected}
      selectedBadge={
        <Tag tone="gold" size="sm" className="uppercase">
          Założone
        </Tag>
      }
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={option.label}
      className="h-[236px] flex-col gap-1 px-3 pb-3.5 text-[30px]"
    >
      <PartTilePreview category={category} option={option} className="h-[128px] w-[128px]" />
      {option.label}
      {option.tagline && <span className="text-center text-[21px] font-medium leading-tight text-ink-500">{option.tagline}</span>}
    </GameButton>
  );
}
