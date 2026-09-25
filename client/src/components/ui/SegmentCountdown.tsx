import { cn } from "./cn";

interface SegmentCountdownProps {
  /** Сколько сегментов всего (обычно = секунд на отсчёт). */
  total: number;
  /** Сколько ещё горит. */
  lit: number;
  className?: string;
}

// Отсчёт сегментами: 1 сегмент = 1 секунда, каждую секунду гаснет один.
// Детям проще сосчитать горящие квадратики, чем прочитать число.
export default function SegmentCountdown({ total, lit, className }: SegmentCountdownProps) {
  return (
    <div className={cn("flex gap-2.5", className)} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={cn(
            "pix-frame block h-7 w-12 [--px-depth:6px]",
            i < lit ? "surface-gold" : "bg-mute-400 [--px-shade:var(--color-mute-500)]",
          )}
        />
      ))}
    </div>
  );
}
