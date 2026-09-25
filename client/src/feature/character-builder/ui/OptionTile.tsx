import type { CharacterOption } from "../model/options";
import type { BuilderCategory } from "./CategoryTabs";
import PartPreview from "./PartPreview";
import GameButton from "../../../components/ui/Button";
import Tag from "../../../components/ui/Tag";

// Целые масштабы превью в карточке (голова выше, ноги ниже и шире).
const TILE_SCALE = { head: 3, body: 4, legs: 5 };

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
      <PartPreview part={category} optionId={option.id} scale={TILE_SCALE} height={128} />
      {option.label}
      {option.tagline && <span className="text-center text-[21px] font-medium leading-tight text-ink-500">{option.tagline}</span>}
    </GameButton>
  );
}
