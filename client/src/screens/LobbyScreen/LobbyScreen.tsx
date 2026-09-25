import { useState } from "react";
import ScreenShell from "../../components/layout/ScreenShell";
import { useConnectionStatus, useGameEmit, useGameState } from "../../game/GameContext";
import type { GameState, PlayerRole } from "../../game/types";
import { motion } from "motion/react";
import PartnerLogo from "../../components/brand/PartnerLogo";
import PixelIcon from "../../components/ui/PixelIcon";
import ScarfStripe from "../../components/ui/ScarfStripe";

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

    // Три состояния слота: свободен (стрелка), выбран мной ("TO TY"),
    // недоступен — занят другим терминалом ("ZAJĘTE" с замком) или я уже
    // выбрал другой слот / нет связи (просто приглушён, без подписи).
    const surface = isMe ? "surface-grass" : disabled ? "surface-mute" : "surface-paper";

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isMe}
        aria-pressed={isMe}
        className={`pix-frame pix-raised pix-press flex h-[140px] w-[720px] items-center gap-7 pb-1.5 pl-[22px] pr-9 font-ui font-bold leading-none text-ink ${surface}`}
      >
        <span
          className={`pix-frame grid h-[100px] w-[100px] shrink-0 place-items-center pb-2.5 font-display text-[96px] font-normal leading-none [--px-depth:8px] ${
            isMe ? "surface-paper" : disabled ? "bg-mute-500 [--px-c:var(--color-ink-500)]" : "surface-gold"
          }`}
        >
          {role === "player_1" ? "1" : "2"}
        </span>
        <span className="flex-1 text-left text-[48px] uppercase">{label}</span>
        <span className="flex items-center gap-3 text-[26px] uppercase">
          {isMe ? (
            <>
              To ty <PixelIcon name="check" scale={4} />
            </>
          ) : taken ? (
            <>
              <PixelIcon name="lock" scale={3} /> Zajęte
            </>
          ) : disabled ? null : (
            <span className="animate-px-nudge">
              <PixelIcon name="arrow" scale={6} />
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <ScreenShell>
      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative h-full w-full"
      >
        <header className="absolute inset-x-12 top-11 flex items-center justify-between">
          <PartnerLogo partner="wks" />
          <span className="font-display text-[52px] leading-none tracking-[0.12em] text-ink-700">PENALTY SHOWDOWN</span>
          <PartnerLogo partner="roboklocki" />
        </header>

        <h1 className="text-outline absolute inset-x-0 top-[188px] text-center font-display text-[160px] font-normal uppercase leading-none">
          Wybierz stanowisko
        </h1>

        <div className="absolute left-1/2 top-[420px] flex -translate-x-1/2 flex-col gap-[52px]">
          {renderSlotButton("player_1", "Gracz 1")}
          {renderSlotButton("player_2", "Gracz 2")}
        </div>

        <footer className="absolute inset-x-0 top-[806px] text-center text-[36px] font-semibold text-ink-700">
          {mySelection ? (
            <span>
              Czekamy na drugiego gracza<span className="animate-px-blink">…</span>
            </span>
          ) : (
            <span className="animate-px-blink">Dotknij swojego gracza</span>
          )}
        </footer>

        <p className="absolute inset-x-0 bottom-[52px] text-center text-[28px] font-bold uppercase tracking-[0.08em] text-ink">
          WKS Śląsk Wrocław × Roboklocki
        </p>
        <ScarfStripe className="absolute inset-x-0 bottom-0 shadow-[0_-4px_0_0_var(--color-ink)]" />
      </motion.main>
    </ScreenShell>
  );
}
