import type { PlayerRole } from "../../../game/types";

export interface GameHudProps {
  currentRound: number;
  totalRounds: number;
  scores: { player_1: number; player_2: number };
  myRole: PlayerRole | null;
  isStriker: boolean;
}

export default function GameHud({
  currentRound,
  totalRounds,
  scores,
  myRole,
  isStriker,
}: GameHudProps) {
  const roleLabel = isStriker ? "NAPASTNIK" : "BRAMKARZ";

  return (
    <header className="grid flex-none grid-cols-[1fr_auto_1fr] items-center gap-[clamp(0.5rem,2vw,2rem)] border-b-4 border-[#d1d5db] bg-[#f8fafc] px-[clamp(0.75rem,2vw,2.5rem)] py-[clamp(0.5rem,1.4vh,1.25rem)] text-[#172554]">
      <div className="flex flex-col leading-none">
        <span className="font-['Baloo_2'] text-[clamp(0.6rem,1vw,0.95rem)] font-semibold uppercase tracking-[0.2em] text-green-900/65">RUNDA</span>
        <span className="font-['Anton'] text-[clamp(1.25rem,2.6vw,2.6rem)] tracking-wide text-blue-950">
          {currentRound} / {totalRounds}
        </span>
      </div>

      <div className="flex items-center gap-[clamp(0.4rem,1.2vw,1.25rem)] whitespace-nowrap rounded-2xl border-2 border-gray-200 bg-white px-[clamp(0.6rem,1.8vw,1.75rem)] py-[clamp(0.2rem,0.8vh,0.6rem)] shadow-[0_3px_0_#d1d5db]" aria-label={`Wynik. Gracz 1: ${scores.player_1}. Gracz 2: ${scores.player_2}`}>
        <span className={`font-['Baloo_2'] text-[clamp(0.6rem,1.1vw,1.1rem)] font-semibold tracking-[0.12em] ${myRole === "player_1" ? "text-green-900 opacity-100" : "text-gray-400"}`}>
          GRACZ 1
        </span>
        <span className="font-['Anton'] text-[clamp(1.4rem,3vw,3rem)] leading-none text-blue-950">
          {scores.player_1} <span className="text-gray-300">—</span> {scores.player_2}
        </span>
        <span className={`font-['Baloo_2'] text-[clamp(0.6rem,1.1vw,1.1rem)] font-semibold tracking-[0.12em] ${myRole === "player_2" ? "text-red-900 opacity-100" : "text-gray-400"}`}>
          GRACZ 2
        </span>
      </div>

         <div
           className={`flex flex-col items-end justify-self-end rounded-2xl border-2 px-[clamp(0.6rem,1.6vw,1.5rem)] py-[clamp(0.25rem,0.8vh,0.7rem)] leading-none shadow-[0_3px_0_rgba(23,37,84,0.2)] ${isStriker ? "border-red-900 bg-red-500 text-white" : "border-blue-900 bg-blue-500 text-white"}`}
        data-testid="role-banner"
      >
        <span className="font-['Baloo_2'] text-[clamp(0.55rem,0.9vw,0.9rem)] font-semibold uppercase tracking-[0.2em] opacity-80">TWOJA ROLA</span>
        <span className="font-['Anton'] text-[clamp(1.1rem,2.4vw,2.4rem)] tracking-wide">{roleLabel}</span>
      </div>
    </header>
  );
}
