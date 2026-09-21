import { type ReactNode } from "react";

interface ScreenShellProps {
  children: ReactNode;
  /** "light" — яркая трава (лобби/конструктор), "dark" — приглушённая (матч). */
  tone?: "light" | "dark";
  /**
   * Точка замены заглушки на реальный арт: когда появится фото стадиона,
   * достаточно передать сюда URL — вёрстка экрана не меняется.
   */
  backgroundImage?: string;
  className?: string;
}

// Общий полноэкранный каркас фона для всех "не-стартовых" экранов — тема
// "стадион" вместо плоской заливки (полосы кошения + виньетка, см. index.css).
//
// ВАЖНО: html/body заблокированы (overflow: hidden, см. index.css) — это
// нужно против случайных зум-жестов и rubber-band скролла на киоске. Но это
// означает, что контент экрана, который не влезает по высоте на конкретном
// планшете (например конструктор персонажа с тремя рядами карточек),
// становится физически недостижимым — прокрутить некуда. Поэтому сам
// ScreenShell даёт СВОЙ внутренний скролл-контейнер: внешний div остаётся
// фиксированного размера (кадр киоска), а children прокручиваются локально.
export default function ScreenShell({ children, tone = "light", backgroundImage, className = "" }: ScreenShellProps) {
  const toneClass = tone === "dark" ? "pitch-bg-dark" : "pitch-bg";

  return (
    <div
      className={`relative h-dvh w-full overflow-hidden ${toneClass} ${className}`}
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      <div className="relative z-10 h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}
