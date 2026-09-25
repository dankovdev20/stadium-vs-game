import { useState } from "react";
import ScreenShell from "../../components/layout/ScreenShell";
import { useConnectionStatus, useGameEmit, useGameState } from "../../game/GameContext";
import type { GameState, PlayerRole } from "../../game/types";
import { motion } from "motion/react";

// App монтирует экран с key={resetEpoch}: после room:hard_reset он
// пересоздаётся с нуля, и оптимистичный выбор ниже не может "пережить" сброс.
// Раньше фаза LOBBY до и после сброса была одна и та же, экран не
// перемонтировался — и терминал, успевший выбрать роль, навсегда показывал
// её выбранной, хотя на сервере её уже не было (стенд вставал намертво).
export default function LobbyScreen() {
  const emit = useGameEmit();
  const { sync, myRole, lastError } = useGameState();
  const { connected } = useConnectionStatus();

  // Локальный "оптимистичный" выбор — ставим его СРАЗУ по тапу, не дожидаясь
  // ответа сервера (role:assigned). На тач-стенде это закрывает окно в
  // несколько кадров, за которое можно успеть тапнуть и по второй роли тоже.
  //
  // Запоминаем, какая ошибка была на момент тапа: любой НОВЫЙ room:error
  // (сервер отклонил выбор) автоматически гасит оптимистичный выбор — без
  // effect'а и без setState в нём, просто производным значением.
  const [pending, setPending] = useState<{ role: PlayerRole; errorAtTap: GameState["lastError"] } | null>(null);
  const pendingRole = pending && pending.errorAtTap === lastError ? pending.role : null;

  const slots = sync?.slots ?? { player_1_taken: false, player_2_taken: false };
  // Роль, которую этот клиент уже выбрал (подтверждённо или оптимистично) —
  // пока она есть, вторая роль с этого же клиента недоступна в принципе.
  const mySelection = myRole ?? pendingRole;

  const renderSlotButton = (role: PlayerRole, label: string) => {
    const taken = role === "player_1" ? slots.player_1_taken : slots.player_2_taken;
    const isMe = mySelection === role;
    // Без связи тап ушёл бы в никуда, а оптимистичный выбор так и висел бы.
    const disabled = (taken && !isMe) || (mySelection !== null && !isMe) || !connected;

    const handleClick = () => {
      if (mySelection || !connected) return; // защита от повторного/двойного тапа
      setPending({ role, errorAtTap: lastError });
      emit("player:select_role", role);
    };

    return (
      <motion.button
        onClick={handleClick}
        disabled={disabled || isMe}
        whileTap={disabled || isMe ? undefined : { scale: 0.97, rotateX: 3, rotateY: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
        className={`group relative flex min-h-24 w-full max-w-80 flex-col items-center justify-center gap-1 border-2 border-b-[7px] py-4 pl-16 pr-6 font-['Press_Start_2P'] text-base uppercase leading-relaxed tracking-normal transition-all duration-100 active:translate-y-1 active:border-b-2 sm:text-lg ${
          isMe
            ? "border-[#d7e9dc] border-b-[#a5c7ae] bg-[#d7e9dc] text-[#173b2b] shadow-[0_0_24px_rgba(215,233,220,0.3)]"
            : disabled
              ? "cursor-not-allowed border-emerald-900 border-b-emerald-950 bg-emerald-950/70 text-emerald-700"
              : "border-[#a5c7ae]/80 border-b-[#234f38] bg-[#173b2b]/90 text-[#d7e9dc] shadow-[0_0_18px_rgba(215,233,220,0.1)] active:border-[#d7e9dc] active:border-b-[#a5c7ae] active:text-white"
        }`}
      >
        <motion.span
          aria-hidden="true"
          animate={disabled ? { opacity: 1 } : { opacity: [0.25, 1, 0.25], x: [0, 8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute left-5 top-1/2 -translate-y-1/2 font-['Press_Start_2P'] text-lg sm:text-xl ${
            disabled ? "text-slate-400" : "text-[#d7e9dc]"
          }`}
        >
          {disabled ? "×" : ">"}
        </motion.span>
        <span className="flex items-center justify-center gap-3 text-center">
          <span>{label}</span>
          {isMe && <span className="text-xl">✓</span>}
        </span>
        {disabled && <span className="text-xs leading-relaxed tracking-normal text-slate-400 sm:text-sm">(Zajety)</span>}
      </motion.button>
    );
  };

  return (
    <ScreenShell tone="light">
      <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden">
        <motion.main
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="h-full min-h-0 w-full"
        >
          <div className="relative flex h-full min-h-0 flex-col justify-center overflow-hidden border-2 border-emerald-400/50 px-5 py-5 perspective-[1000px] sm:px-12 sm:py-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 rounded-[4%] shadow-[inset_0_0_78px_rgba(0,0,0,0.48)] [background:radial-gradient(ellipse_at_center,transparent_46%,rgba(5,18,13,0.34)_78%,rgba(2,10,7,0.58)_100%)]"
            />
            <motion.div
              aria-hidden="true"
              animate={{ x: ["-115%", "245%"], opacity: [0, 0.1, 0.1, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.12, 0.88, 1],
              }}
              className="pointer-events-none absolute inset-y-0 left-0 z-50 w-2/5 -skew-x-12"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(235, 247, 238, 0.8), transparent)",
              }}
            />
            <motion.div
              aria-hidden="true"
              animate={{ x: ["-115%", "245%"], opacity: [0, 0.14, 0.14, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.12, 0.88, 1],
              }}
              className="pointer-events-none absolute inset-y-0 left-0 z-50 w-1/3 -skew-x-12"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(235, 247, 238, 0.55), transparent)",
              }}
            />
            <header className="absolute left-5 right-5 top-5 flex items-start justify-between font-['Press_Start_2P'] text-xs uppercase leading-relaxed tracking-normal text-[#d7e9dc] sm:left-12 sm:right-12 sm:top-8 sm:text-sm">
              <span>1UP</span>
              <span className="text-center text-[#b9d4c0]/80">PENALTY SHOWDOWN</span>
              <span>2UP</span>
            </header>

            <div className="mb-8 text-center sm:mb-10">
              <p className="mb-4 font-['Press_Start_2P'] text-xs uppercase leading-relaxed tracking-normal text-[#b9d4c0] sm:mb-5 sm:text-sm">
                Select player
              </p>
              <h1 className="font-['Press_Start_2P'] text-2xl uppercase leading-relaxed tracking-normal text-[#d7e9dc] drop-shadow-[3px_3px_0_#234f38] sm:text-5xl">
                Wybierz stanowisko
              </h1>
            </div>

            <div className="flex flex-col items-center gap-5">
              {renderSlotButton("player_1", "Gracz 1")}
              {renderSlotButton("player_2", "Gracz 2")}
            </div>

            {myRole && (
              <footer className="mt-8 min-h-6 text-center font-['Press_Start_2P'] text-xs uppercase leading-relaxed tracking-normal text-[#b9d4c0]/80 sm:mt-10 sm:text-sm">
                Oczekiwanie na drugiego gracza...
              </footer>
            )}
          </div>
        </motion.main>
      </div>
    </ScreenShell>
  );
}
