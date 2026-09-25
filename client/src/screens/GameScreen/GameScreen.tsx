import { useState } from "react";
import ScreenShell from "../../components/layout/ScreenShell";
import { useGameScreenModel } from "./model/useGameScreenModel";
import Hud from "./ui/Hud";
import PenaltyScene from "./ui/PenaltyScene";
import ResultOverlay from "./ui/ResultOverlay";
import RoleHint from "./ui/RoleHint";
import RoleSplash from "./ui/RoleSplash";
import ScarfWipe from "./ui/ScarfWipe";

// Шарф-шторка идёт ~0.9с; заставка первого раунда ждёт, пока она проедет.
const FIRST_SPLASH_DELAY_MS = 700;

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
//
// Экран живёт весь матч (App держит его смонтированным и в PLAYING, и в
// ROUND_RESULT), поэтому ScarfWipe играет один раз — на входе в матч, а
// RoleSplash с key={раунд} — в начале каждого раунда.
export default function GameScreen() {
  const model = useGameScreenModel();
  // Раунд, на котором экран смонтировался: его заставка ждёт шарф-шторку.
  const [firstRound] = useState(model.currentRound);

  return (
    <ScreenShell tone="arena">
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

        <Hud
          currentRound={model.currentRound}
          totalRounds={model.totalRounds}
          scores={model.scores}
          isStriker={model.isStriker}
          myRole={model.myRole}
          roundResolved={model.roundResultVisible}
        />

        <RoleHint
          isStriker={model.isStriker}
          hasChosen={model.hasChosen}
          rivalChosen={model.rivalChosen}
          roundResultVisible={model.roundResultVisible}
        />

        {!model.roundResultVisible && (
          <RoleSplash
            key={model.currentRound}
            round={model.currentRound}
            totalRounds={model.totalRounds}
            isStriker={model.isStriker}
            delayMs={model.currentRound === firstRound ? FIRST_SPLASH_DELAY_MS : 0}
          />
        )}

        {model.roundResultVisible && model.lastRoundResult && <ResultOverlay result={model.lastRoundResult} />}

        <ScarfWipe />
      </div>
    </ScreenShell>
  );
}
