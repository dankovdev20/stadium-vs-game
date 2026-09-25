import GameButton from "../../../components/ui/Button";
import type { CharacterSelection } from "../../../game/types";
import { HEAD_OPTIONS, BODY_OPTIONS, LEGS_OPTIONS } from "../model/options";
import { useCharacterBuilder } from "../model/useCharacterBuilder";
import CategoryTabs from "./CategoryTabs";
import OptionGrid from "./OptionGrid";
import PodiumStage from "./PodiumStage";

interface CharacterBuilderProps {
  onSubmit: (character: CharacterSelection) => void;
  disabled?: boolean;
}

// Раскладка "przymierzalnia" (примерочная): слева — панель с табами
// категорий и сеткой крупных карточек-вариантов активной категории,
// справа — подиум с манекеном на всю высоту (см. PodiumStage). Рассчитано
// на фикс 1920×1080 без прокрутки (см. ScreenShell) — обе панели заняты
// содержимым почти целиком, свободного места не остаётся.
//
// Оформление — терминальная рамка в стиле PlayAgainModal (border-[#587a63],
// шапка-заголовок, Press_Start_2P) вместо старых Panel/Poppins/gold.
export default function CharacterBuilder({ onSubmit, disabled = false }: CharacterBuilderProps) {
  const { headId, bodyId, legsId, setHeadId, setBodyId, setLegsId, activeCategory, setActiveCategory, character } =
    useCharacterBuilder();

  const active =
    activeCategory === "head"
      ? { options: HEAD_OPTIONS, selectedId: headId, onSelect: setHeadId }
      : activeCategory === "body"
        ? { options: BODY_OPTIONS, selectedId: bodyId, onSelect: setBodyId }
        : { options: LEGS_OPTIONS, selectedId: legsId, onSelect: setLegsId };

  return (
    <div className="flex h-full w-full gap-6">
      <div className="flex h-full w-[500px] shrink-0 flex-col gap-4 border-2 border-[#587a63] bg-[#07180e] p-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)]">
        <div className="flex h-10 items-center justify-center border-2 border-[#b8d0bc] bg-[#0b2418] font-['Press_Start_2P'] text-[10px] uppercase leading-none tracking-normal text-[#b8d0bc] sm:h-11 sm:text-xs">
          Przymierzalnia
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-2 pb-2">
          <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
          <OptionGrid category={activeCategory} options={active.options} selectedId={active.selectedId} onSelect={active.onSelect} disabled={disabled} />
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col gap-4">
        <div className="min-h-0 flex-1 overflow-hidden border-2 border-[#587a63] bg-[#07180e] p-2 shadow-[6px_6px_0_rgba(0,0,0,0.45)]">
          <PodiumStage character={character} />
        </div>

        <GameButton onClick={() => onSubmit(character)} disabled={disabled} variant="terminal" className="self-center">
          {disabled ? "Oczekiwanie na rywala..." : "ZATWIERDŹ POSTAĆ"}
        </GameButton>
      </div>
    </div>
  );
}