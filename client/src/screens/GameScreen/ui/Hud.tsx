import SevenSegmentDigit from "./SevenSegmentDigit";

interface HudProps {
  currentRound: number;
  totalRounds: number;
  scores: { player_1: number; player_2: number };
  isStriker: boolean;
}

// Уголок-табло: строгая версия — без скруглений (было rounded-2xl/rounded-xl,
// читалось слишком "мультяшно" на фоне серьёзного счёта), острые прямые
// углы и тонкая рамка вместо мягкой карточки. Цифры счёта — не текст
// (даже не "цифровым" шрифтом), а настоящие семисегментные индикаторы
// (см. SevenSegmentDigit) с видимыми погашенными сегментами — тем самым
// эффектом, который и делает электронное табло электронным табло, а не
// просто моноширинным числом.
//
// "GRACZ 1"/"GRACZ 2" над каждой цифрой — раньше там были только мелкие
// "1"/"2", и было неочевидно, чей это счёт (два числа через ":" читаются
// как время, а не как счёт двух игроков). Подписи по-польски — язык не
// переключаем нигде в приложении, нет причин делать тут исключение.
export default function Hud({ currentRound, totalRounds, scores, isStriker }: HudProps) {
  const onColor = "var(--color-scoreboard-led)";
  const offColor = "color-mix(in srgb, var(--color-scoreboard-led) 12%, var(--color-scoreboard-screen))";
  const glow = "rgba(127,214,163,0.55)";

  return (
    <div
      className="absolute left-6 top-6 z-30 border-2 border-[var(--color-scoreboard-frame)] bg-[var(--color-scoreboard-frame)] p-1"
      aria-label="Wynik meczu"
    >
      <div className="flex flex-col items-center gap-2 border border-black/20 bg-[var(--color-scoreboard-screen)] px-6 py-3">
        <span className="whitespace-nowrap font-['Press_Start_2P'] text-[10px] uppercase tracking-wide text-[var(--color-scoreboard-frame)]">
          Runda {currentRound}/{totalRounds}
        </span>

        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <span className="whitespace-nowrap font-['Press_Start_2P'] text-[8px] uppercase leading-none text-[var(--color-scoreboard-frame)]">
              Gracz 1
            </span>
            <SevenSegmentDigit value={String(scores.player_1)} onColor={onColor} offColor={offColor} glow={glow} />
          </div>

          <span className="mb-[6px] flex h-[46px] flex-col items-center justify-center gap-[7px]" aria-hidden="true">
            <span className="h-[5px] w-[5px]" style={{ background: onColor, boxShadow: `0 0 6px ${glow}` }} />
            <span className="h-[5px] w-[5px]" style={{ background: onColor, boxShadow: `0 0 6px ${glow}` }} />
          </span>

          <div className="flex flex-col items-center gap-1.5">
            <span className="whitespace-nowrap font-['Press_Start_2P'] text-[8px] uppercase leading-none text-[var(--color-scoreboard-frame)]">
              Gracz 2
            </span>
            <SevenSegmentDigit value={String(scores.player_2)} onColor={onColor} offColor={offColor} glow={glow} />
          </div>
        </div>

        <div
          className={`whitespace-nowrap border px-2.5 py-1 font-['Press_Start_2P'] text-[9px] uppercase leading-none ${
            isStriker ? "border-[#f0b4b4] bg-[var(--color-danger-500)] text-white" : "border-[#b9d7f0] bg-[var(--color-sky-500)] text-white"
          }`}
        >
          {isStriker ? "Napastnik" : "Bramkarz"}
        </div>
      </div>
    </div>
  );
}
