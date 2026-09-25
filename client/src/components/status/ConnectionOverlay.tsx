import { motion } from "motion/react";
import { useConnectionStatus } from "../../game/GameContext";

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
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-[#020a06]/85 backdrop-blur-sm"
      role="status"
    >
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [0.25, 1, 0.25] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="font-['Press_Start_2P'] text-3xl text-[#d7e9dc]"
      >
        ...
      </motion.span>
      <p className="font-['Press_Start_2P'] text-center text-base uppercase leading-relaxed text-[#d7e9dc] sm:text-xl">
        {connected ? "Wracamy do gry" : "Łączenie z serwerem"}
      </p>
    </motion.div>
  );
}
