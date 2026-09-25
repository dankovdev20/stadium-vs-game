import Panel from "../../../components/ui/Panel";
import GameButton from "../../../components/ui/Button";
import PixelIcon from "../../../components/ui/PixelIcon";
import type { CharacterSelection } from "../../../game/types";
import { HEAD_OPTIONS, BODY_OPTIONS, LEGS_OPTIONS, getOptionById, type CharacterOption } from "../model/options";
import { useCharacterBuilder } from "../model/useCharacterBuilder";
import CategoryTabs from "./CategoryTabs";
import OptionGrid from "./OptionGrid";
import PodiumStage from "./PodiumStage";

interface CharacterBuilderProps {
  onSubmit: (character: CharacterSelection) => void;
  disabled?: boolean;
}

// Случайный вариант, ОТЛИЧНЫЙ от текущего — чтобы "Losuj" всегда что-то
// меняло во всех трёх частях, а не иногда "ничего не произошло".
function pickOther(options: CharacterOption[], currentId: number) {
  const pool = options.filter((o) => o.id !== currentId);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

// Раздевалка на сцене 1920×1080: слева — персонаж-герой на подиуме
// (PodiumStage) и кнопка "Losuj", справа — гардероб: вкладки категорий,
// сетка 3×2 вариантов и "Gotowe!" в конце. Поток для ребёнка: выбрал
// справа → увидел себя слева → подтвердил там же, где выбирал.
export default function CharacterBuilder({ onSubmit, disabled = false }: CharacterBuilderProps) {
  const { headId, bodyId, legsId, setHeadId, setBodyId, setLegsId, activeCategory, setActiveCategory, character } =
    useCharacterBuilder();

  const active =
    activeCategory === "head"
      ? { options: HEAD_OPTIONS, selectedId: headId, onSelect: setHeadId }
      : activeCategory === "body"
        ? { options: BODY_OPTIONS, selectedId: bodyId, onSelect: setBodyId }
        : { options: LEGS_OPTIONS, selectedId: legsId, onSelect: setLegsId };

  const worn = {
    head: getOptionById(HEAD_OPTIONS, headId),
    body: getOptionById(BODY_OPTIONS, bodyId),
    legs: getOptionById(LEGS_OPTIONS, legsId),
  };

  const randomize = () => {
    if (disabled) return;
    setHeadId(pickOther(HEAD_OPTIONS, headId));
    setBodyId(pickOther(BODY_OPTIONS, bodyId));
    setLegsId(pickOther(LEGS_OPTIONS, legsId));
  };

  return (
    <>
      <PodiumStage character={character} />

      <GameButton
        size="md"
        variant="secondary"
        icon={<PixelIcon name="dice" scale={5} />}
        onClick={randomize}
        disabled={disabled}
        className="absolute left-12 top-[176px]"
      >
        Losuj
      </GameButton>

      <Panel className="absolute left-[1040px] top-[176px] grid w-[832px] gap-6 p-8">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} worn={worn} outfit={character} />
        <OptionGrid category={activeCategory} options={active.options} outfit={character} selectedId={active.selectedId} onSelect={active.onSelect} disabled={disabled} />
        <GameButton
          onClick={() => onSubmit(character)}
          disabled={disabled}
          icon={disabled ? undefined : <PixelIcon name="check" scale={5} />}
          className="w-full uppercase"
        >
          {disabled ? (
            <span>
              Czekamy na rywala<span className="animate-px-blink">…</span>
            </span>
          ) : (
            "Gotowe!"
          )}
        </GameButton>
      </Panel>
    </>
  );
}
