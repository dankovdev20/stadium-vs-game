import Panel from "../../../components/ui/Panel";
import Badge from "../../../components/ui/Badge";

interface HudProps {
  currentRound: number;
  totalRounds: number;
  scores: { player_1: number; player_2: number };
  isStriker: boolean;
}

export default function Hud({ currentRound, totalRounds, scores, isStriker }: HudProps) {
  return (
    <Panel tone="dark" className="flex w-full max-w-xl flex-col items-center gap-3 px-6 py-4 font-[Poppins] text-white">
      <Badge tone="neutral">
        Runda {currentRound} / {totalRounds}
      </Badge>
      <div className="text-2xl font-bold">
        Gracz 1: {scores.player_1} — {scores.player_2} : Gracz 2
      </div>
      <Badge tone={isStriker ? "gold" : "sky"} className="text-sm">
        {isStriker ? "Twoja tura: Napastnik (strzelaj!)" : "Twoja tura: Bramkarz (broń!)"}
      </Badge>
    </Panel>
  );
}
