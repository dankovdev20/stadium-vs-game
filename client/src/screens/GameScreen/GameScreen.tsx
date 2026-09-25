import ScreenShell from "../../components/layout/ScreenShell";
import { useGameScreenModel } from "./model/useGameScreenModel";
import Hud from "./ui/Hud";
import PenaltyScene from "./ui/PenaltyScene";
import ResultOverlay from "./ui/ResultOverlay";
import StatusPill from "./ui/StatusPill";

// Тонкий композиционный корень: вся логика — в model/useGameScreenModel,
// вся вёрстка — в ui/*. Сам файл только связывает одно с другим.
//
// ВАЖНО про layout: PenaltyScene — абсолютный слой на ВЕСЬ экран (inset-0),
// а не участник flex-потока. Раньше он был зажат паддингами/HUD/текстом в
// flex-колонке — визуально это и читалось как "картинка в рамке", хотя сама
// сцена была написана как full-bleed. HUD/статус/оверлей результата — это
// не документ-flow, а плавающие оверлеи ПОВЕРХ сцены.
//
// [container-type:size] — здесь, а не только внутри PenaltyScene: баннер
// результата (ResultOverlay) использует cqh-размеры для рамки/скруглений/
// свечения (тот же язык, что у HUD), и живёт СНАРУЖИ PenaltyScene, в этом
// div. Этот div и PenaltyScene.root — ТОЧНО одного размера (PenaltyScene —
// absolute inset-0 внутри него), так что 1cqh тут и 1cqh внутри
// PenaltyScene — одно и то же число; дублирование container-type не
// создаёт рассинхрона.
export default function GameScreen() {
  const model = useGameScreenModel();

  return (
    <ScreenShell tone="dark">
      <div className="relative h-full w-full [container-type:size]">
        <div className="absolute inset-0">
          <PenaltyScene
            strikerCharacter={model.strikerCharacter}
            keeperCharacter={model.keeperCharacter}
            isStriker={model.isStriker}
            myZone={model.myZone}
            result={model.roundResultVisible ? model.lastRoundResult : null}
            hasChosen={model.hasChosen}
            onSelectZone={model.selectZone}
          />
        </div>

        <Hud currentRound={model.currentRound} totalRounds={model.totalRounds} scores={model.scores} isStriker={model.isStriker} />

        <StatusPill
          hasChosen={model.hasChosen}
          rivalChosen={model.rivalChosen}
          roundResultVisible={model.roundResultVisible}
        />

        {model.roundResultVisible && model.lastRoundResult && <ResultOverlay result={model.lastRoundResult} />}
      </div>
    </ScreenShell>
  );
}
