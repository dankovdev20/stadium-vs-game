import { useState } from "react";
import ScreenShell from "../../components/layout/ScreenShell";
import { useGameEmit, useGameState } from "../../game/GameContext";
import CharacterBuilder from "../../feature/character-builder/ui/CharacterBuilder";
import type { CharacterSelection } from "../../game/types";
import { motion } from "motion/react";

export default function CustomizationScreen() {
  const emit = useGameEmit();
  const { sync, myRole } = useGameState();
  const [submitted, setSubmitted] = useState(false);
  // После F5/реконнекта локальный флаг пустой, но сервер уже мог принять
  // персонажа — тогда кнопка должна остаться в "ожидании", а не звать жать снова.
  const confirmedOnServer = !!(myRole && sync?.characters[myRole]);

  const handleSubmit = (character: CharacterSelection) => {
    setSubmitted(true);
    emit("character:submit", character);
  };

  return (
    <ScreenShell tone="light">
      <div className="flex h-full w-full flex-col gap-4 px-6 py-4">
        <section className="w-full self-center border-4 border-[#587a63] bg-[#020a06] p-2 text-[#b8d0bc] shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
          <motion.h1 
          aria-hidden="true"
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{ duration: 2, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
          className="px-2 pt-2 text-center font-['Press_Start_2P'] text-xs uppercase leading-relaxed tracking-normal text-[#d7e9dc] drop-shadow-[3px_3px_0_#163d27] sm:text-lg">
            Zbuduj swojego zawodnika
          </motion.h1>
        </section>

        <div className="min-h-0 flex-1">
          <CharacterBuilder onSubmit={handleSubmit} disabled={submitted || confirmedOnServer} />
        </div>
      </div>
    </ScreenShell>
  );
}