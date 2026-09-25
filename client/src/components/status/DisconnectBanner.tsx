import { useEffect, useState } from "react";
import { useGameState } from "../../game/GameContext";

const ROLE_LABELS = { player_1: "Gracz 1", player_2: "Gracz 2" } as const;

// Баннер "соперник отвалился" с живым отсчётом до серверного сброса.
// Прячется сам, как только слот снова занят в state:sync — это надёжнее,
// чем полагаться только на room:player_reconnected (событие можно пропустить,
// если в этот момент переподключались и мы сами).
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
    <div className="fixed inset-x-0 top-0 z-30 bg-[var(--color-danger-500)] p-4 text-center font-[Poppins] font-semibold text-white">
      {ROLE_LABELS[disconnectedInfo.role]} stracił połączenie. Czekamy na powrót: {secondsLeft}s
    </div>
  );
}
