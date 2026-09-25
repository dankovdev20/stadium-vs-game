import type { CharacterSelection } from "../../../game/types";
import CharacterSprite from "./CharacterSprite";
import Pedestal from "../svg/Pedestal";

interface PodiumStageProps {
  character: CharacterSelection;
}

// Левая половина раздевалки — персонаж как герой экрана: мягкий светлый
// ореол, травяной подиум и сам персонаж лицом к ребёнку, дышит в стойке
// (idle). Точка опоры — стопы на подиуме, как на арене матча.
// Масштаб ×12 (рост ≈ 564px): крупнее корона упиралась бы в заголовок.
const FEET = { x: 520, y: 896 };
const SCALE = 12;

export default function PodiumStage({ character }: PodiumStageProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute left-[150px] top-[190px] h-[740px] w-[740px] bg-[radial-gradient(circle,rgb(255_255_255/0.9)_0%,rgb(255_255_255/0)_68%)]"
      />
      <Pedestal className="absolute left-[244px] top-[806px] drop-shadow-[0_14px_0_rgb(42_46_82/0.18)]" />
      <div className="absolute" style={{ left: FEET.x, top: FEET.y }}>
        <CharacterSprite character={character} anim="idle" direction="down" frameMs={450} scale={SCALE} />
      </div>
    </>
  );
}
