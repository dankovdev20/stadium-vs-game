import PixelIcon from "../../../components/ui/PixelIcon";
import Panel from "../../../components/ui/Panel";
import type { PlayerRole } from "../../../game/types";

/** Исход одного удара — для цветных кружков на табло (см. kickHistory). */
export type KickResult = "goal" | "miss";

interface HudProps {
  currentRound: number;
  totalRounds: number;
  scores: { player_1: number; player_2: number };
  isStriker: boolean;
  myRole: PlayerRole | null;
  /** Текущий раунд уже разыгран (фаза ROUND_RESULT) — его удар считается сделанным. */
  roundResolved: boolean;
  /**
   * Заделка на будущее: история исходов ударов каждого игрока по порядку.
   * Сервер её пока не присылает — без неё кружки показывают только
   * "удар сделан / идёт сейчас / впереди". Как только история появится
   * (новое поле в state:sync или накопление round:resolved), достаточно
   * передать её сюда — кружки станут зелёными (гол) и коралловыми (мимо).
   */
  kickHistory?: Partial<Record<PlayerRole, KickResult[]>>;
}

const ROWS: { role: PlayerRole; label: string }[] = [
  { role: "player_1", label: "Gracz 1" },
  { role: "player_2", label: "Gracz 2" },
];

const other = (role: PlayerRole): PlayerRole => (role === "player_1" ? "player_2" : "player_1");

const PIP_STYLES = {
  goal: "bg-led shadow-[0_0_12px_2px_rgb(127_214_163/0.5)]",
  miss: "bg-coral-500",
  done: "bg-board-text-dim",
  now: "bg-board-screen-2 animate-pip-now",
  empty: "bg-led-dim",
} as const;

// Табло в стиле ТВ-графики серии пенальти: по строке на игрока, по кружку
// на каждый его удар (10 раундов, роли чередуются — по 5 ударов на
// игрока), очки крупными LED-цифрами. Мяч — у того, кто сейчас бьёт,
// перчатка — у вратаря; "TY" — строка этого терминала. Всё выводится из
// state:sync (раунд + кто бьёт), без новой логики и новых событий.
//
// Корпус/экран — тот же "физический объект", что нарисованное табло над
// трибунами (цвета board-* в tokens.css).
export default function Hud({ currentRound, totalRounds, scores, isStriker, myRole, roundResolved, kickHistory }: HudProps) {
  // Кто бьёт в текущем раунде. Роли меняются каждый раунд, первый раунд
  // бьёт player_1 — это и запасной вариант, пока роль терминала неизвестна.
  const strikerNow: PlayerRole = myRole ? (isStriker ? myRole : other(myRole)) : currentRound % 2 === 1 ? "player_1" : "player_2";
  const kicksPerPlayer = Math.ceil(totalRounds / 2);

  const kicksTaken = (role: PlayerRole) => {
    let taken = 0;
    for (let round = 1; round < currentRound; round++) {
      const strikerThen = (currentRound - round) % 2 === 0 ? strikerNow : other(strikerNow);
      if (strikerThen === role) taken++;
    }
    if (roundResolved && strikerNow === role) taken++;
    return taken;
  };

  return (
    <Panel tone="board" className="absolute left-12 top-10 z-30" screenClassName="grid gap-2.5 px-[26px] pb-5 pt-4" aria-label="Wynik meczu">
      <div className="flex items-center justify-between text-[24px] font-semibold uppercase tracking-[0.08em] text-board-text">
        <span>
          Runda {currentRound}/{totalRounds}
        </span>
        <span>Rzuty karne</span>
      </div>

      {ROWS.map(({ role, label }, rowIndex) => {
        const kicking = role === strikerNow;
        const taken = kicksTaken(role);
        const history = kickHistory?.[role];

        return (
          <div key={role} className="grid gap-2.5">
            {rowIndex > 0 && <div className="h-1 bg-board-edge" />}
            <div className="grid grid-cols-[40px_170px_146px_76px] items-center gap-x-4">
              <span className={kicking ? "text-ink" : "text-board-text-dim"}>
                <PixelIcon name={kicking ? "ball" : "glove"} scale={kicking ? 3 : 4} />
              </span>
              <span className={`flex items-center gap-2.5 whitespace-nowrap text-[30px] font-bold uppercase ${kicking ? "text-white" : "text-board-text-dim"}`}>
                {label}
                {role === myRole && <span className="bg-gold-500 px-[7px] pb-[5px] pt-[3px] text-[18px] leading-none text-ink">TY</span>}
              </span>
              <span className="flex gap-[9px]" aria-hidden="true">
                {Array.from({ length: kicksPerPlayer }, (_, i) => {
                  const state =
                    i < taken ? (history?.[i] ?? "done") : i === taken && kicking && !roundResolved ? "now" : "empty";
                  return <i key={i} className={`block h-[22px] w-[22px] ${PIP_STYLES[state]}`} />;
                })}
              </span>
              <span className="text-right font-display text-[92px] leading-[0.78] text-led [text-shadow:0_0_14px_rgb(127_214_163/0.55)]">
                {scores[role]}
              </span>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}
