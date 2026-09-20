import type { CharacterSelection } from "../../../game/types";
import CharacterSprite from "./CharacterSprite";
import Pedestal from "../svg/Pedestal";

interface PodiumStageProps {
  character: CharacterSelection;
}

// "Примерочная": манекен не висит в пустой рамке, а стоит на подиуме —
// прожектор-подсветка сверху, вертикальные полосы фона (шкафчики
// раздевалки) и сам подиум под ногами. Занимает всю высоту родителя, чтобы
// не оставалось пустого места на 1920×1080.
export default function PodiumStage({ character }: PodiumStageProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 64px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 34%, rgba(255,201,60,0.18) 0%, rgba(0,0,0,0) 72%)" }}
        aria-hidden="true"
      />

      <div className="animate-podium-float relative z-[1] h-[72%]">
        <CharacterSprite character={character} size="xl" />
      </div>

      <Pedestal className="relative z-0 -mt-[2%] w-[80%] max-w-[440px]" />
    </div>
  );
}
