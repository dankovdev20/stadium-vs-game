import { type ReactNode } from "react";
import { STAGE_HEIGHT, STAGE_WIDTH, useKioskScale } from "./kioskScale";

// Фиксированная сцена 1920×1080 по центру окна (см. kioskScale.ts). Внутри
// всё в обычных px макета — ровно те числа, что в дизайн-плане.
export default function KioskStage({ children }: { children: ReactNode }) {
  const scale = useKioskScale();

  return (
    <div
      className="absolute left-1/2 top-1/2 overflow-hidden"
      style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `translate(-50%, -50%) scale(${scale})` }}
      data-kiosk-stage
    >
      {children}
    </div>
  );
}
