import { motion } from "motion/react";
import { useConnectionStatus } from "../../game/GameContext";
import Panel from "../ui/Panel";
import PixelIcon from "../ui/PixelIcon";

// Полноэкранная заглушка, пока у ЭТОГО терминала нет связи с сервером или
// идёт восстановление сессии после переподключения. Слой перехватывает тапы
// сразу (иначе дети жмут кнопки, а emit уходит в пустоту), а видимым
// становится с задержкой — короткие обрывы на LAN не мигают на экране.
export default function ConnectionOverlay() {
  const { connected, restoring } = useConnectionStatus();
  if (connected && !restoring) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/60"
      role="status"
    >
      <div style={{ zoom: "var(--kiosk-scale, 1)" }}>
        <Panel className="grid justify-items-center gap-6 px-20 pb-14 pt-12">
          <span className="animate-ball-hop text-ink">
            <PixelIcon name="ball" scale={10} />
          </span>
          <p className="font-display text-[88px] uppercase leading-[0.85]">{connected ? "Wracamy do gry" : "Łączenie z serwerem"}</p>
          <p className="text-[30px] font-semibold text-ink-700">Chwileczkę…</p>
        </Panel>
      </div>
    </motion.div>
  );
}
