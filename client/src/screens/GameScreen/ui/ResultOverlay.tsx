import type { RoundResolvedPayload } from "../../../game/types";

const OUTCOME_LABELS: Record<RoundResolvedPayload["result"]["outcome"], string> = {
  GOL: "GOL!",
  OBRONA_PERFEKCYJNA: "OBRONA!",
  OBRONA_NOGA: "OBRONA NOGĄ!",
  FUKS_BRAMKARZA: "FUKS BRAMKARZA!",
  SLUPEK_POPRZECZKA: "SŁUPEK!",
  NAD_POPRZECZKA: "NAD POPRZECZKĄ!",
};

interface ResultOverlayProps {
  result: RoundResolvedPayload;
}

// Оверлей исхода раунда поверх PitchScene. Раньше жил в отдельной
// screens/ResultScreen/ — перенесено сюда, потому что ROUND_RESULT никогда
// не был самостоятельным экраном, только состоянием GameScreen.
export default function ResultOverlay({ result }: ResultOverlayProps) {
  const isGoal = result.result.isGoal;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/60">
      <h2
        className={`font-[Anton] text-6xl uppercase tracking-wide drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] ${
          isGoal ? "text-green-400" : "text-red-400"
        }`}
      >
        {OUTCOME_LABELS[result.result.outcome]}
      </h2>
      <p className="font-[Poppins] text-white/80">{result.result.details}</p>
    </div>
  );
}
