import { type ReactNode } from "react";
import stadiumArt from "../../assets/gameScreen.jpg";
import KioskStage from "./KioskStage";

interface ScreenShellProps {
  children?: ReactNode;
  /**
   * "stadium" — арт стадиона под светлой пастельной вуалью (лобби,
   * раздевалка, финал, экраны ожидания): фон спокойный, контент поверх
   * читается. "arena" — для экрана матча, который рисует арт сам внутри
   * сцены; снаружи (поля вне 16:9) — тот же арт, притушенный чернилами.
   */
  tone?: "stadium" | "arena";
}

// Общий каркас всех экранов: фон на весь вьюпорт + сцена 1920×1080.
//
// Фон — один и тот же арт стадиона на всех экранах: ребёнок не "переходит
// между приложениями", а остаётся на одном стадионе (трибуна → раздевалка →
// поле). Заменил зелёную CRT-сетку со scanlines.
//
// Скролла нет намеренно: html/body заблокированы (kiosk, см. index.css), а
// сцена целиком масштабируется под окно — контенту не бывает тесно.
export default function ScreenShell({ children, tone = "stadium" }: ScreenShellProps) {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-sky-300">
      <img src={stadiumArt} alt="" aria-hidden="true" className="pixelated absolute inset-0 h-full w-full object-cover" />
      <div
        aria-hidden="true"
        className={
          tone === "arena"
            ? "absolute inset-0 bg-ink/55"
            : "absolute inset-0 bg-[linear-gradient(180deg,rgb(230_242_251/0.8)_0%,rgb(238_233_247/0.86)_100%)]"
        }
      />
      <KioskStage>{children}</KioskStage>
    </div>
  );
}
