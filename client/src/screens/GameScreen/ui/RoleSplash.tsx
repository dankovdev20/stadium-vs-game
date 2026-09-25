import PixelIcon from "../../../components/ui/PixelIcon";

interface RoleSplashProps {
  round: number;
  totalRounds: number;
  isStriker: boolean;
  /** Задержка появления, мс — на первом раунде ждём, пока проедет шарф-шторка. */
  delayMs?: number;
}

// Заставка роли в начале каждого раунда: "STRZELASZ!" / "BRONISZ!" крупно
// по центру ~1.3с (.animate-role-splash, index.css), затем исчезает сама.
// Монтируется с key={раунд} (см. GameScreen) — CSS-анимация просто
// проигрывается заново на каждый новый раунд. pointer-events-none: тапы
// по зонам под ней проходят, заставка ничего не блокирует.
export default function RoleSplash({ round, totalRounds, isStriker, delayMs = 0 }: RoleSplashProps) {
  return (
    <div
      className={`animate-role-splash pix-frame pix-frame-lg pointer-events-none absolute left-1/2 top-[46%] z-40 flex items-center gap-10 py-8 pl-10 pr-16 [--px-depth:12px] [--px-drop:16px] ${
        isStriker ? "surface-coral" : "surface-azure"
      }`}
      style={{ animationDelay: `${delayMs}ms` }}
      aria-hidden="true"
    >
      <PixelIcon name={isStriker ? "ball" : "glove"} scale={14} />
      <span className="grid gap-2 whitespace-nowrap text-ink">
        <span className="text-[32px] font-bold uppercase tracking-[0.1em]">
          Runda {round}/{totalRounds}
        </span>
        <span className="font-display text-[150px] uppercase leading-[0.8]">{isStriker ? "Strzelasz!" : "Bronisz!"}</span>
      </span>
    </div>
  );
}
