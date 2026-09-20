import Panel from "../../../components/ui/Panel";
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
      <Panel tone="dark" className="flex h-full w-[500px] shrink-0 flex-col gap-4 px-6 py-6">
        <p className="text-center font-[Poppins] text-sm font-bold uppercase tracking-widest text-white/70">Przymierzalnia</p>
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
        <OptionGrid category={activeCategory} options={active.options} selectedId={active.selectedId} onSelect={active.onSelect} disabled={disabled} />
      </Panel>

      <div className="flex h-full flex-1 flex-col gap-4">
        <Panel tone="dark" className="min-h-0 flex-1 overflow-hidden px-6 py-6">
          <PodiumStage character={character} />
        </Panel>

        <GameButton onClick={() => onSubmit(character)} disabled={disabled} className="self-center">
          {disabled ? "Oczekiwanie na rywala..." : "ZATWIERDŹ POSTAĆ"}
        </GameButton>
      </div>
    </div>
  );
}
