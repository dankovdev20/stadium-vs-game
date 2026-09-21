import { useEffect, useState } from "react";
import { Trophy, RotateCcw, Check, Hourglass } from "lucide-react";
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
    <section
      className="w-full border-4 border-[#587a63] bg-[#020a06] p-2 text-[#b8d0bc] shadow-[10px_10px_0_rgba(0,0,0,0.55)] sm:p-3"
      data-testid="play-again-modal"
    >
      <div className="flex h-12 items-center justify-between border-2 border-[#b8d0bc] bg-[#0b2418] px-3 font-['Press_Start_2P'] text-[11px] uppercase leading-none sm:h-14 sm:px-4 sm:text-xs">
        <span>GAME_OVER.EXE</span>
        <div className="flex items-center gap-1" aria-hidden="true">
          <span className="flex h-7 w-7 items-center justify-center border border-[#b8d0bc] bg-[#163d27] text-xs">_</span>
          <span className="flex h-7 w-7 items-center justify-center border border-[#b8d0bc] bg-[#163d27] text-xs">□</span>
          <span className="flex h-7 w-7 items-center justify-center border border-[#d7e9dc] bg-[#a33b3b] text-xs">×</span>
        </div>
      </div>

      <div className="m-2 border-2 border-[#587a63] bg-[#07180e] px-5 pb-6 pt-6 sm:m-4 sm:px-10 sm:pb-8 sm:pt-8">
      
        <div className="flex flex-col items-center pt-7">
          <h2 className="font-['Press_Start_2P'] text-center text-xl uppercase leading-relaxed text-[#b8d0bc] drop-shadow-[3px_3px_0_#163d27] sm:text-3xl">
            KONIEC MECZU
          </h2>
          <div className="mt-7 flex items-center gap-5">
            <div
              className={`flex h-24 w-24 items-center justify-center border-4 border-solid ${
                isWinner ? "border-[#d7e9dc] bg-[#2f8f4e]" : "border-[#f0b4b4] bg-[#a33b3b]"
              }`}
            >
              <Trophy size={42} color="#ffffff" strokeWidth={2.5} />
            </div>
          </div>
          <p className="mt-6 font-['Press_Start_2P'] text-xs uppercase text-[#8eaf96] sm:text-sm">Zwycięzca:</p>
          <p className="mb-6 mt-3 font-['Press_Start_2P'] text-lg uppercase text-white sm:text-xl">{winnerName}</p>

          <GameButton
            onClick={handleTap}
            icon={myReady ? Check : RotateCcw}
            disabled={myReady}
            size="md"
            variant="terminal"
            aria-label="Graj ponownie"
          >
            {myReady ? "Gotowy! Czekamy na rywala..." : "Graj ponownie"}
          </GameButton>

          <div className="mt-7 flex items-center gap-2 font-['Press_Start_2P'] text-[10px] uppercase text-[#b8d0bc] sm:text-xs">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-6 w-8 border-2 border-solid ${
                  i < readyCount ? "border-[#b8d0bc] bg-[#24643a]" : "border-[#405d47] bg-[#0d2013]"
                }`}
              />
            ))}
            <span className="ml-2">{readyCount}/2 GOTOWYCH</span>
          </div>
        </div>

        {deadline && (
          <div className="mt-7 border-2 border-[#b8d0bc] bg-white p-2 text-[#102a19]">
            <div className="flex items-center justify-between border-2 border-[#102a19] px-3 py-3 font-['Press_Start_2P'] text-[10px] uppercase sm:text-xs">
              <span className="inline-flex items-center gap-3"><Hourglass size={16} /> CZAS NA RESTART</span>
              <span>{remainingSec}s</span>
            </div>
            <div className="mt-2 h-5 border-2 border-[#102a19] bg-[#c9e0cc] p-1">
              <div
                className="h-full bg-[#24643a] transition-[width] duration-200 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
