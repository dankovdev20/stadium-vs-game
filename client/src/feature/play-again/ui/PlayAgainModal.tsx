import { useEffect, useState } from "react";
import { PartyPopper, Trophy, RotateCcw, Check, Hourglass } from "lucide-react";
import GameButton from "../../../components/ui/Button";
import { useGameEmit, useGameState } from "../../../game/GameContext";
import type { PlayerRole } from "../../../game/types";

const RESTART_VOTE_TIMEOUT_SEC = 10;

const WINNER_LABELS: Record<PlayerRole | "REMIS", string> = {
  player_1: "Gracz 1",
  player_2: "Gracz 2",
  REMIS: "Remis",
};

// Самодостаточный компонент: сам читает GameContext (а не получает снэпшот
// пропсами), поэтому обратный отсчёт и счётчик голосов обновляются вживую
// по мере прихода state:sync, даже пока тост уже открыт.
export default function PlayAgainModal() {
  const emit = useGameEmit();
  const { lastGameOver, myRole, sync } = useGameState();
  const restart = sync?.restart;
  const deadline = restart?.deadline ?? null;

  const [remainingSec, setRemainingSec] = useState(RESTART_VOTE_TIMEOUT_SEC);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => setRemainingSec(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline]);

  if (!lastGameOver) return null;

  const isWinner = lastGameOver.winner !== "REMIS" && lastGameOver.winner === myRole;
  const winnerName = WINNER_LABELS[lastGameOver.winner];

  const myReady = myRole === "player_1" ? restart?.player_1_ready : restart?.player_2_ready;
  const readyCount = (restart?.player_1_ready ? 1 : 0) + (restart?.player_2_ready ? 1 : 0);
  const progressPct = Math.max(0, Math.min(100, (remainingSec / RESTART_VOTE_TIMEOUT_SEC) * 100));

  const handleTap = () => {
    if (myReady) return;
    emit("game:restart");
  };

  return (
    <section className="w-full h-full" data-testid="play-again-modal">
      <div className="h-3 bg-[var(--color-gold-500)]" />
      <div className="flex flex-col items-center px-6 pt-6 pb-5">
        <h2 className="font-[Anton] text-center leading-none text-2xl text-blue-950 tracking-wide">
          KONIEC MECZU
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <PartyPopper size={20} color="#f6b93b" />
          <div
            className={`flex items-center justify-center rounded-full w-16 h-16 border-4 border-solid ${
              isWinner ? "border-green-900 bg-green-500" : "border-red-900 bg-red-500"
            }`}
          >
            <Trophy size={30} color="#ffffff" strokeWidth={2.5} />
          </div>
          <PartyPopper size={20} color="#f6b93b" className="scale-x-[-1]" />
        </div>
        <p className="font-[Baloo-2] mt-3 text-sm text-green-900/65">Zwycięzca: </p>
        <p className="font-[Anton] mb-3 text-xl text-zinc-900 tracking-wide">{winnerName}</p>

        <GameButton
          onClick={handleTap}
          icon={myReady ? Check : RotateCcw}
          disabled={myReady}
          size="md"
          aria-label="Graj ponownie"
        >
          {myReady ? "Gotowy! Czekamy na rywala..." : "Graj ponownie"}
        </GameButton>

        <div className="mt-4 flex items-center gap-1.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`w-5 h-4 border-2 border-solid rounded-[4px_4px_2px_2px] ${
                i < readyCount ? "bg-green-500 border-green-900" : "bg-gray-300 border-gray-500"
              }`}
            />
          ))}
          <span className="font-[Baloo-2] text-sm ml-1.5 text-gray-900/75 inline-flex items-center gap-1">
            {readyCount}/2 gotowych
            {deadline && (
              <>
                <Hourglass size={12} className="ml-1" /> {remainingSec}s
              </>
            )}
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-[var(--color-gold-700)] transition-[width] duration-200 ease-linear"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </section>
  );
}
