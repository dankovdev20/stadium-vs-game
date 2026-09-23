// Настоящая семисегментная цифра — не шрифт, а 7 CSS-сегментов (клипы
// шестиугольником, как у настоящих LED). Шрифт (даже "цифровой") рисует
// только ЗАЖЖЁННЫЕ сегменты сплошным глифом — а подлинность электронного
// табло держится на том, что ПОГАШЕННЫЕ сегменты тоже видны, тусклым
// контуром того же цвета. Этого шрифтом не получить, только явным
// перечислением 7 сегментов и их состояния on/off на цифру.
const SEGMENTS: Record<string, [boolean, boolean, boolean, boolean, boolean, boolean, boolean]> = {
  // порядок: a(верх) b(право-верх) c(право-низ) d(низ) e(лево-низ) f(лево-верх) g(середина)
  "0": [true, true, true, true, true, true, false],
  "1": [false, true, true, false, false, false, false],
  "2": [true, true, false, true, true, false, true],
  "3": [true, true, true, true, false, false, true],
  "4": [false, true, true, false, false, true, true],
  "5": [true, false, true, true, false, true, true],
  "6": [true, false, true, true, true, true, true],
  "7": [true, true, true, false, false, false, false],
  "8": [true, true, true, true, true, true, true],
  "9": [true, true, true, true, false, true, true],
};

const W = 26;
const H = 46;
const T = 6;

const HEX_H = `polygon(${T / 2}px 0, calc(100% - ${T / 2}px) 0, 100% 50%, calc(100% - ${T / 2}px) 100%, ${T / 2}px 100%, 0 50%)`;
const HEX_V = `polygon(50% 0, 100% ${T / 2}px, 100% calc(100% - ${T / 2}px), 50% 100%, 0 calc(100% - ${T / 2}px), 0 ${T / 2}px)`;

interface SevenSegmentDigitProps {
  value: string;
  onColor: string;
  offColor: string;
  glow?: string;
}

export default function SevenSegmentDigit({ value, onColor, offColor, glow }: SevenSegmentDigitProps) {
  const seg = SEGMENTS[value] ?? SEGMENTS["8"].map(() => false);
  const fill = (on: boolean) => ({ background: on ? onColor : offColor, boxShadow: on && glow ? `0 0 6px ${glow}` : undefined });

  return (
    <div className="relative shrink-0" style={{ width: W, height: H }} aria-hidden="true">
      <div className="absolute left-[3px] top-0" style={{ width: W - 6, height: T, clipPath: HEX_H, ...fill(seg[0]) }} />
      <div className="absolute right-0 top-[5px]" style={{ width: T, height: H / 2 - T + 1, clipPath: HEX_V, ...fill(seg[1]) }} />
      <div className="absolute bottom-[1px] right-0" style={{ width: T, height: H / 2 - T + 1, clipPath: HEX_V, ...fill(seg[2]) }} />
      <div className="absolute bottom-0 left-[3px]" style={{ width: W - 6, height: T, clipPath: HEX_H, ...fill(seg[3]) }} />
      <div className="absolute bottom-[1px] left-0" style={{ width: T, height: H / 2 - T + 1, clipPath: HEX_V, ...fill(seg[4]) }} />
      <div className="absolute left-0 top-[5px]" style={{ width: T, height: H / 2 - T + 1, clipPath: HEX_V, ...fill(seg[5]) }} />
      <div className="absolute left-[3px]" style={{ top: H / 2 - T / 2, width: W - 6, height: T, clipPath: HEX_H, ...fill(seg[6]) }} />
    </div>
  );
}
