import { useState } from "react";
import ScreenShell from "../../components/layout/ScreenShell";
import Panel from "../../components/ui/Panel";
import { useGameEmit } from "../../game/GameContext";
import CharacterBuilder from "../../feature/character-builder/ui/CharacterBuilder";
import type { CharacterSelection } from "../../game/types";

export default function CustomizationScreen() {
  const emit = useGameEmit();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (character: CharacterSelection) => {
    setSubmitted(true);
    emit("character:submit", character);
  };

  return (
    <ScreenShell tone="light">
      <div className="flex h-full w-full flex-col gap-4 px-6 py-4">
        <Panel className="self-center px-8 py-2">
          <h1 className="text-center font-[Anton] text-xl uppercase tracking-wide text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] sm:text-2xl">
            Krok 1: Zbuduj swojego zawodnika
          </h1>
        </Panel>

        <div className="min-h-0 flex-1">
          <CharacterBuilder onSubmit={handleSubmit} disabled={submitted} />
        </div>
      </div>
    </ScreenShell>
  );
}
