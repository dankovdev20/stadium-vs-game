import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * "paper" — бумажная панель (гардероб, модалки, экраны ожидания).
   * "board" — корпус табло с тёмным экраном внутри (HUD, баннер результата);
   * `screenClassName` уходит на сам экран.
   */
  tone?: "paper" | "board";
  screenClassName?: string;
}

// Панель — один предмет на экране, который надо отделить от фона. Толстая
// рамка чернилами (6px), блик сверху, ступень снизу, жёсткая тень без blur.
export default function Panel({ children, tone = "paper", screenClassName, className, ...props }: PanelProps) {
  if (tone === "board") {
    return (
      <div className={cn("pix-frame pix-frame-lg surface-board p-3 [--px-depth:8px] [--px-drop:12px]", className)} {...props}>
        <div className={cn("bg-board-screen shadow-[inset_0_0_0_4px_var(--color-board-edge)]", screenClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("pix-frame pix-frame-lg surface-paper text-ink [--px-depth:8px] [--px-drop:14px]", className)} {...props}>
      {children}
    </div>
  );
}
