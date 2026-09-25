import { useEffect, useState } from "react";
import { useGameState } from "../../game/GameContext";
import PixelIcon from "../ui/PixelIcon";
import SegmentCountdown from "../ui/SegmentCountdown";

const ROLE_LABELS = { player_1: "Gracz 1", player_2: "Gracz 2" } as const;

// Баннер "соперник отвалился" с живым отсчётом до серверного сброса.
// Прячется сам, как только слот снова занят в state:sync — это надёжнее,
// чем полагаться только на room:player_reconnected (событие можно пропустить,
// если в этот момент переподключались и мы сами).
//
// Бумажная полоса сверху, не красная заливка: коралл в игре занят ролью
// нападающего, а обрыв связи — не "ошибка ребёнка", а просто ожидание.
export default function DisconnectBanner() {
  const { disconnectedInfo, sync } = useGameState();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!disconnectedInfo) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [disconnectedInfo]);

  if (!disconnectedInfo) return null;
  const stillAway = !sync || !sync.slots[`${disconnectedInfo.role}_taken`];
  if (!stillAway) return null;

  const elapsedSec = Math.max(0, (now - disconnectedInfo.receivedAt) / 1000);
  const secondsLeft = Math.max(0, Math.ceil(disconnectedInfo.timeoutSec - elapsedSec));

  return (
    <div className="fixed inset-x-0 top-0 z-30 bg-paper shadow-[0_6px_0_0_var(--color-ink)]" role="status">
      <div className="flex items-center justify-center gap-7 px-8 py-4 text-ink" style={{ zoom: "var(--kiosk-scale, 1)" }}>
        <span className="pix-frame surface-gold grid h-16 w-16 shrink-0 place-items-center [--px-depth:6px]">
          <PixelIcon name="plug" scale={5} />
        </span>
        <p className="text-[30px] font-bold">{ROLE_LABELS[disconnectedInfo.role]} stracił połączenie. Czekamy na powrót</p>
        <SegmentCountdown total={Math.max(1, Math.round(disconnectedInfo.timeoutSec))} lit={secondsLeft} />
        <span className="font-display text-[52px] leading-none">{secondsLeft} s</span>
      </div>
    </div>
  );
}
