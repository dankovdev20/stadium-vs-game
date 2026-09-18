import ScreenShell from "../../components/layout/ScreenShell";
import Panel from "../../components/ui/Panel";
import GameButton from "../../components/ui/Button";
import { useGameEmit, useGameState } from "../../game/GameContext";

export default function LobbyScreen() {
  const emit = useGameEmit();
  const { sync, myRole } = useGameState();

  const slots = sync?.slots ?? { player_1_taken: false, player_2_taken: false };

  const renderSlotButton = (role: "player_1" | "player_2", label: string) => {
    const taken = role === "player_1" ? slots.player_1_taken : slots.player_2_taken;
    const isMe = myRole === role;
    const disabled = taken && !isMe;

    return (
      <GameButton
        onClick={() => emit("player:select_role", role)}
        disabled={disabled || isMe}
        variant={isMe ? "secondary" : "primary"}
        size="lg"
      >
        {label}
        {disabled && " (Zajęty)"}
        {isMe && " ✓"}
      </GameButton>
    );
  };

  return (
    <ScreenShell tone="light">
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-10 px-4">
        <Panel className="px-10 py-6">
          <h1 className="text-center font-[Anton] text-4xl uppercase tracking-wide text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] sm:text-5xl">
            Wybierz stanowisko
          </h1>
        </Panel>

        <div className="flex flex-col gap-6 sm:flex-row">
          {renderSlotButton("player_1", "Gracz 1")}
          {renderSlotButton("player_2", "Gracz 2")}
        </div>

        {myRole && (
          <p className="font-[Poppins] font-semibold text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Oczekiwanie na drugiego gracza...
          </p>
        )}
      </div>
    </ScreenShell>
  );
}
