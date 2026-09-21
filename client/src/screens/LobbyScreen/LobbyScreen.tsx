import { useEffect, useState } from "react";
import ScreenShell from "../../components/layout/ScreenShell";
import Panel from "../../components/ui/Panel";
import GameButton from "../../components/ui/Button";
import { useGameEmit, useGameState } from "../../game/GameContext";
import type { PlayerRole } from "../../game/types";

export default function LobbyScreen() {
  const emit = useGameEmit();
  const { sync, myRole, lastError } = useGameState();

  // Локальный "оптимистичный" выбор — ставим его СРАЗУ по тапу, не дожидаясь
  // ответа сервера (role:assigned). На тач-стенде это закрывает окно в
  // несколько кадров, за которое можно успеть тапнуть и по второй роли тоже
  // (сервер сейчас не запрещает одному сокету занять обе роли).
  const [pendingRole, setPendingRole] = useState<PlayerRole | null>(null);

  // Если сервер отклонил наш выбор (роль уже занята кем-то другим) — снимаем
  // локальную блокировку, чтобы игрок мог попробовать снова.
  useEffect(() => {
    if (lastError?.code === "ROLE_TAKEN" && !myRole) {
      setPendingRole(null);
    }
  }, [lastError, myRole]);

  const slots = sync?.slots ?? { player_1_taken: false, player_2_taken: false };
  // Роль, которую этот клиент уже выбрал (подтверждённо или оптимистично) —
  // пока она есть, вторая роль с этого же клиента недоступна в принципе.
  const mySelection = myRole ?? pendingRole;

  const renderSlotButton = (role: PlayerRole, label: string) => {
    const taken = role === "player_1" ? slots.player_1_taken : slots.player_2_taken;
    const isMe = mySelection === role;
    const disabled = (taken && !isMe) || (mySelection !== null && !isMe);

    const handleClick = () => {
      if (mySelection) return; // защита от повторного/двойного тапа
      setPendingRole(role);
      emit("player:select_role", role);
    };

    return (
      <GameButton
        onClick={handleClick}
        disabled={disabled || isMe}
        variant={isMe ? "secondary" : "primary"}
        size="lg"
      >
        {label}
        {disabled && !isMe && " (Zajęty)"}
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
