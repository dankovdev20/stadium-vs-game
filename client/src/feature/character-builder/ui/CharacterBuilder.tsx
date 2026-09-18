import Panel from "../../../components/ui/Panel";
import GameButton from "../../../components/ui/Button";
import type { CharacterSelection } from "../../../game/types";
import { HEAD_OPTIONS, BODY_OPTIONS, LEGS_OPTIONS } from "../model/options";
import { useCharacterBuilder } from "../model/useCharacterBuilder";
import CategoryColumn from "./CategoryColumn";
import CharacterSprite from "./CharacterSprite";

interface CharacterBuilderProps {
  onSubmit: (character: CharacterSelection) => void;
  disabled?: boolean;
}

// Раскладка "стенд": панели выбора — узкими колонками слева (умещены
// горизонтально одна к другой, варианты внутри каждой — вертикально),
// крупный стенд персонажа — справа. Рассчитано на фикс 1920×1080 без
// прокрутки — раньше три Panel на всю ширину экрана не влезали по высоте
// и кнопку подтверждения было не докрутить (см. ScreenShell).
export default function CharacterBuilder({ onSubmit, disabled = false }: CharacterBuilderProps) {
  const { headId, bodyId, legsId, setHeadId, setBodyId, setLegsId, character } = useCharacterBuilder();

  return (
    <div className="flex h-full w-full gap-6">
      <div className="flex h-full gap-3">
        <CategoryColumn title="Głowa" options={HEAD_OPTIONS} selectedId={headId} onSelect={setHeadId} disabled={disabled} />
        <CategoryColumn title="Korpus" options={BODY_OPTIONS} selectedId={bodyId} onSelect={setBodyId} disabled={disabled} />
        <CategoryColumn title="Nogi" options={LEGS_OPTIONS} selectedId={legsId} onSelect={setLegsId} disabled={disabled} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <Panel tone="dark" className="flex items-center justify-center px-20 py-14">
          <CharacterSprite character={character} size="xl" />
        </Panel>

        <GameButton onClick={() => onSubmit(character)} disabled={disabled}>
          {disabled ? "Oczekiwanie na rywala..." : "ZATWIERDŹ POSTAĆ"}
        </GameButton>
      </div>
    </div>
  );
}
