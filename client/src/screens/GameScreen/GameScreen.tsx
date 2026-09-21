import ScreenShell from "../../components/layout/ScreenShell";
import { useGameScreenModel } from "./model/useGameScreenModel";
import Hud from "./ui/Hud";
import PenaltyScene from "./ui/PenaltyScene";
import ResultOverlay from "./ui/ResultOverlay";

// Тонкий композиционный корень: вся логика — в model/useGameScreenModel,
// вся вёрстка — в ui/*. Сам файл только связывает одно с другим.
export default function GameScreen() {
  const model = useGameScreenModel();

  return (
    <ScreenShell tone="dark">
      <div className="relative flex h-full w-full flex-col items-center gap-4 px-4 py-4">
        <Hud currentRound={model.currentRound} totalRounds={model.totalRounds} scores={model.scores} isStriker={model.isStriker} />

        <div className="relative min-h-0 w-full flex-1">
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

        <p className="font-[Poppins] font-semibold text-white/85">
          {model.hasChosen
            ? "Twój wybór zapisany. Czekaj na strzał!"
            : model.rivalChosen
              ? "Rywal podjął decyzję! Twój ruch!"
              : "Wybierz strefę"}
        </p>

        {model.roundResultVisible && model.lastRoundResult && <ResultOverlay result={model.lastRoundResult} />}
      </div>
    </ScreenShell>
  );
}
