import { PartyPopper, Trophy, RotateCcw, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import GameButton from "../../../components/ui/Button";

export interface PlayAgainModalProps {
  isWinner?: boolean;
  duration?: number;
  winnerName: string;
  readyCount?: number;
  totalPlayers?: number;
  onPlayAgain?: () => void;
}

export default function PlayAgainModal({
  isWinner = true,
  duration = 10,
  winnerName,
  readyCount = 0,
  totalPlayers = 2,
  onPlayAgain,
}: PlayAgainModalProps) {
  const [localReady, setLocalReady] = useState(false);

  const handleTap = () => {
    if (localReady) return;
    setLocalReady(true);
    onPlayAgain?.();
  };

  return (
    <section className="min-h-full w-full" data-testid="play-again-modal">
      <div className="h-3 bg-[#FFC93C]" />
      <div className="flex flex-col items-center px-8 pt-10 pb-8">
        <h2 className="font-[Anton] text-center leading-none text-3xl text-blue-950 tracking-wide">
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
        <p className="font-[Baloo-2] mt-3 text-lg text-green-900/65">Zwycięzca: </p>
        <p className="font-[Anton] mb-3 text-xl text-zinc-900 tracking-wide">{winnerName}</p>

        <GameButton
          onClick={handleTap}
          icon={localReady ? Check : RotateCcw}
          disabled={localReady}
          className={localReady ? "disabled" : ""}
          aria-label="Graj ponownie"
        >
          {localReady ? "Gotowy!" : "Graj ponownie"}
        </GameButton>

        <div className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: totalPlayers }).map((_, index) => (
            <div
              key={index}
              className={`w-5 h-4 border-2 border-solid rounded-[4px_4px_2px_2px] ${
                index < readyCount ? "bg-green-500 border-green-900" : "bg-gray-300 border-gray-500"
              }`}
            />
          ))}
          <span className="font-[Baloo-2] text-lg ml-1.5 text-gray-900/75">
            {readyCount}/{totalPlayers} gotowych
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-gray-200 overflow-hidden">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration, ease: "linear" }}
          className={`h-full ${isWinner ? "bg-green-600" : "bg-red-600"}`}
        />
      </div>
    </section>
  );
}