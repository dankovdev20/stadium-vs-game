import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import GameButton from "../../../components/ui/Button";
import PixelIcon from "../../../components/ui/PixelIcon";
import ScarfStripe from "../../../components/ui/ScarfStripe";
import SegmentCountdown from "../../../components/ui/SegmentCountdown";
import Tag from "../../../components/ui/Tag";
import { useGameEmit, useGameState } from "../../../game/GameContext";
import type { PlayerRole } from "../../../game/types";

const RESTART_VOTE_TIMEOUT_SEC = 10;

const ROLE_LABELS: Record<PlayerRole, string> = { player_1: "Gracz 1", player_2: "Gracz 2" };
const ROLES: PlayerRole[] = ["player_1", "player_2"];

function winnerFromScores(scores: { player_1: number; player_2: number }): PlayerRole | "REMIS" {
  if (scores.player_1 === scores.player_2) return "REMIS";
  return scores.player_1 > scores.player_2 ? "player_1" : "player_2";
}

// Самодостаточный компонент: сам читает GameContext (а не получает снэпшот
// пропсами), поэтому обратный отсчёт и счётчик голосов обновляются вживую
// по мере прихода state:sync, даже пока тост уже открыт.
//
// Финал — праздник для обоих: итоговый счёт, победитель в золоте, тёплая
// фраза и проигравшему (никаких красных кубков), реванш одной кнопкой.
// Таймер голосования — 10 сегментов, каждую секунду гаснет один.
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

  // game:over приходит один раз — после F5/реконнекта на GAME_OVER его уже
  // не будет, поэтому победителя можно вывести из счёта в state:sync.
  const winner = lastGameOver?.winner ?? (sync ? winnerFromScores(sync.scores) : null);
  const isWinner = !!winner && winner !== "REMIS" && winner === myRole;

  // Конфетти победителю — один раз на открытие модалки.
  useEffect(() => {
    if (!isWinner) return;
    const colors = ["#0f8a45", "#ffffff", "#d7282f", "#ffc93c"];
    confetti({ particleCount: 120, spread: 100, startVelocity: 45, origin: { x: 0.5, y: 0.35 }, shapes: ["square"], colors });
  }, [isWinner]);

  if (!winner) return null;

  const scores = lastGameOver?.scores ?? sync?.scores ?? { player_1: 0, player_2: 0 };
  const isDraw = winner === "REMIS";
  const title = isDraw ? "Remis!" : `Wygrywa ${ROLE_LABELS[winner]}!`;
  const message = isDraw ? "Remis! Kto wygra rewanż?" : isWinner ? "Brawo! Mistrzowski mecz!" : "Świetna gra! Rewanż?";

  const myReady = myRole === "player_1" ? restart?.player_1_ready : restart?.player_2_ready;

  const handleTap = () => {
    if (myReady) return;
    emit("game:restart");
  };

  return (
    <section
      className="pix-frame pix-frame-lg surface-paper grid w-[1000px] justify-items-center font-ui text-ink [--px-depth:8px] [--px-drop:14px]"
      style={{ zoom: "var(--kiosk-scale, 1)" }}
      data-testid="play-again-modal"
    >
      <ScarfStripe className="h-20 shadow-[0_4px_0_0_var(--color-ink)]" />
      <Tag className="-mt-[60px] px-8 pb-3 pt-2 font-display text-[60px] font-normal uppercase">Koniec meczu</Tag>

      <div className="grid justify-items-center gap-[18px] px-14 pb-11 pt-5">
        <PixelIcon name="trophy" scale={9} />
        <h2 className="font-display text-[104px] font-normal uppercase leading-[0.85]">{title}</h2>
        <p className="text-[34px] font-semibold text-ink-700">{message}</p>

        <div className="mt-1.5 flex items-center gap-9">
          {ROLES.map((role, i) => (
            <div key={role} className="contents">
              {i > 0 && <span className="font-display text-[100px] leading-none">:</span>}
              <div
                className={`pix-frame grid w-[250px] justify-items-center pb-[18px] pt-3.5 [--px-depth:8px] ${
                  winner === role ? "surface-gold" : "surface-white"
                }`}
              >
                <span className="text-[28px] font-bold uppercase">
                  {ROLE_LABELS[role]}
                  {role === myRole && " · Ty"}
                </span>
                <span className="font-display text-[120px] leading-[0.8]">{scores[role]}</span>
              </div>
            </div>
          ))}
        </div>

        <GameButton
          onClick={handleTap}
          icon={<PixelIcon name={myReady ? "check" : "reload"} scale={5} />}
          variant={myReady ? "success" : "primary"}
          disabled={myReady}
          selected={!!myReady}
          selectedBadge={null}
          aria-label="Graj ponownie"
          className="mt-3.5 w-[680px] uppercase"
        >
          {myReady ? "Gotowy! Czekamy…" : "Zagraj ponownie"}
        </GameButton>

        <div className="mt-2.5 flex gap-7">
          {ROLES.map((role) =>
            restart?.[`${role}_ready`] ? (
              <Tag key={role} tone="grass">
                <PixelIcon name="check" scale={4} /> {ROLE_LABELS[role]} gotowy
              </Tag>
            ) : (
              <Tag key={role} tone="dashed">
                {ROLE_LABELS[role]} czeka<span className="animate-px-blink">…</span>
              </Tag>
            ),
          )}
        </div>

        {deadline && (
          <div className="mt-1.5 flex items-center gap-[18px]">
            <SegmentCountdown total={RESTART_VOTE_TIMEOUT_SEC} lit={remainingSec} />
            <span className="font-display text-[56px] leading-none">{remainingSec} s</span>
          </div>
        )}
      </div>
    </section>
  );
}
