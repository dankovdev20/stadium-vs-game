import { useEffect, useSyncExternalStore } from "react";

// Экран стенда — ровно 1920×1080 (см. shared/put_me_in_context.md, раздел 1).
// Все экраны верстаются в этих координатах внутри KioskStage и целиком
// масштабируются под окно: на киоске масштаб 1, на ноутбуке разработчика
// картинка просто уменьшается, а не разъезжается.
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

function readScale() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export function useKioskScale() {
  return useSyncExternalStore(subscribe, readScale, () => 1);
}

// Слои поверх сцены, которые живут вне неё (toast "Koniec meczu", оверлей
// связи, баннер обрыва) — берут тот же масштаб через CSS-переменную
// --kiosk-scale (style={{ zoom: "var(--kiosk-scale)" }}).
export function useKioskScaleCssVar() {
  const scale = useKioskScale();
  useEffect(() => {
    document.documentElement.style.setProperty("--kiosk-scale", String(scale));
  }, [scale]);
}

/**
 * Перевод точки сцены (проценты 0..100 от 1920×1080) в долю вьюпорта 0..1 —
 * для canvas-confetti, чей холст лежит на весь вьюпорт, а не на сцене.
 * На киоске это одно и то же; вне 16:9 сцена стоит по центру с полями.
 */
export function stagePointToViewport(xPct: number, yPct: number) {
  const scale = readScale();
  const offsetX = (window.innerWidth - STAGE_WIDTH * scale) / 2;
  const offsetY = (window.innerHeight - STAGE_HEIGHT * scale) / 2;
  return {
    x: (offsetX + (xPct / 100) * STAGE_WIDTH * scale) / window.innerWidth,
    y: (offsetY + (yPct / 100) * STAGE_HEIGHT * scale) / window.innerHeight,
  };
}
