import type { CharacterSelection } from "../../../game/types";
import CharacterSprite from "./CharacterSprite";
import Pedestal from "../svg/Pedestal";

interface PodiumStageProps {
  character: CharacterSelection;
}

// Левая половина раздевалки — персонаж как герой экрана: мягкий
// светлый ореол, травяной подиум и сам персонаж (якорь по стопам, как на
// арене матча — см. GameScreen/model/zoneLayout). Координаты — в px сцены
// 1920×1080 (см. components/layout/KioskStage).
const FEET = { x: 520, y: 896 };
const HEIGHT = 650;

export default function PodiumStage({ character }: PodiumStageProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute left-[150px] top-[190px] h-[740px] w-[740px] bg-[radial-gradient(circle,rgb(255_255_255/0.9)_0%,rgb(255_255_255/0)_68%)]"
      />
      <Pedestal className="absolute left-[244px] top-[806px] drop-shadow-[0_14px_0_rgb(42_46_82/0.18)]" />
      <div
        className="absolute -translate-x-1/2 -translate-y-full"
        style={{ left: FEET.x, top: FEET.y, height: HEIGHT, aspectRatio: "200 / 322" }}
      >
        <div className="animate-podium-float h-full">
          <CharacterSprite character={character} size="xl" />
        </div>
      </div>
    </>
  );
}
