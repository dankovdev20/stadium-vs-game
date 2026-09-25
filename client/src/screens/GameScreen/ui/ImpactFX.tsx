import type { BallChoreography } from "../model/reveal";

interface ImpactFXProps {
  choreography: BallChoreography;
  /** Меняется каждый раунд — гарантирует remount (см. index.css про CSS-анимации вместо Framer тут). */
  roundKey: number;
}

const SPARK_ANGLES = [-70, -35, -10, 15, 40, 70, 105, 145, 180, -145];

// Визуальный эффект момента удара — вспышка/кольцо/искры/"бух" сетки в
// точке контакта мяча. Запускается с задержкой = моменту касания
// (choreography.impactAt), а не сразу на маунт: сам компонент монтируется
// в момент round:resolved, но контакт происходит позже, посреди полёта
// мяча (см. model/reveal.ts — там же общая шкала времени с ui/Ball.tsx,
// оба потребителя читают одни и те же числа, чтобы ничего не разъезжалось).
export default function ImpactFX({ choreography, roundKey }: ImpactFXProps) {
  const { contactPoint, presentation, durationSec } = choreography;
  const delayMs = Math.round(choreography.impactAt * durationSec * 1000);
  const delay = `${delayMs}ms`;

  return (
    <div
      key={roundKey}
      className="pointer-events-none absolute z-[7]"
      style={{ left: `${contactPoint.x}%`, top: `${contactPoint.y}%` }}
      aria-hidden="true"
    >
      {presentation.sceneEffect === "goal" && (
        <>
          <span
            className="animate-net-bulge absolute h-[22cqh] w-[22cqh] min-h-24 min-w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,230,120,0.35)_45%,rgba(255,230,120,0)_75%)]"
            style={{ animationDelay: delay, left: 0, top: 0 }}
          />
          <span
            className="animate-impact-flash absolute h-[10cqh] w-[10cqh] min-h-12 min-w-12 rounded-full bg-white"
            style={{ animationDelay: delay, left: 0, top: 0 }}
          />
        </>
      )}

      {presentation.sceneEffect === "save" && (
        <>
          <span
            className="animate-impact-ring absolute h-[9cqh] w-[9cqh] min-h-10 min-w-10 rounded-full shadow-[inset_0_0_0_4px_rgba(255,255,255,0.9)]"
            style={{ animationDelay: delay, left: 0, top: 0 }}
          />
          <span
            className="animate-impact-flash absolute h-[6cqh] w-[6cqh] min-h-8 min-w-8 rounded-full bg-[var(--color-azure-500)]"
            style={{ animationDelay: delay, left: 0, top: 0 }}
          />
        </>
      )}

      {/* Над перекладиной — мяч лишь чиркает по раме: короткая вспышка без искр и тряски */}
      {presentation.ball === "over" && (
        <span
          className="animate-impact-flash absolute h-[5cqh] w-[5cqh] min-h-7 min-w-7 rounded-full bg-[var(--color-gold-500)]"
          style={{ animationDelay: delay, left: 0, top: 0 }}
        />
      )}

      {presentation.ball === "post" && (
        <>
          <span
            className="animate-impact-flash absolute h-[7cqh] w-[7cqh] min-h-9 min-w-9 rounded-full bg-[var(--color-gold-500)]"
            style={{ animationDelay: delay, left: 0, top: 0 }}
          />
          {SPARK_ANGLES.map((angle, i) => (
            <span
              key={i}
              className="animate-spark-fly absolute h-[0.6cqh] w-[3.4cqh] min-h-1 min-w-4 rounded-full bg-[var(--color-gold-500)]"
              style={{
                animationDelay: delay,
                left: 0,
                top: 0,
                // @ts-expect-error — кастомные CSS-переменные для keyframes (см. index.css .animate-spark-fly)
                "--spark-angle": `${angle}deg`,
                "--spark-dist": "9cqh",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
