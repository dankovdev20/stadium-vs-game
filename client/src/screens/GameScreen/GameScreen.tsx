import { useGameEmit, useGameState } from "../../game/GameContext";
import { motion } from "motion/react";
import { getZoneName } from "./model/zones";
import { useRoundSelection } from "./model/useRoundSelection";
import GameHud from "./ui/GameHud";
import PenaltyScene from "./ui/PenaltyScene";

const ROLE_LABEL: Record<string, string> = { player_1: "GRACZ 1", player_2: "GRACZ 2" };
const screenClass = "fixed inset-0 flex flex-col overflow-hidden bg-[#04070d] bg-[radial-gradient(circle_at_50%_8%,#123055_0%,#081426_55%,#04070d_100%)] font-['Baloo_2'] text-slate-50 [touch-action:manipulation]";

export default function GameScreen() {
  const { sync, myRole, lastChoiceMade, lastRoundResult } = useGameState();
  const emit = useGameEmit();
  const { myZone, hasChosen, rivalChosen, selectZone } = useRoundSelection({ sync, myRole, lastChoiceMade, emit });

  if (!sync || !myRole) {
    return (
      <motion.main initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.38, ease: "easeOut" }} className={`${screenClass} items-center justify-center`} data-testid="game-screen">
        <div className="flex flex-col items-center gap-3 px-[clamp(2rem,6vw,5rem)] py-[clamp(1.5rem,4vh,3rem)] shadow-[0_0_0_4px_rgba(255,255,255,0.14),0_10px_0_rgba(0,0,0,0.6)]">
          <span className="font-['Anton'] text-[clamp(1.75rem,4vw,3.5rem)] tracking-[0.08em] text-[#ffd60a]">Penalty Shootout</span>
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} className="text-[clamp(0.95rem,1.6vw,1.5rem)] uppercase tracking-[0.12em] opacity-75">Synchronizacja z serwerem...</motion.span>
        </div>
      </motion.main>
    );
  }

  const isStriker = sync.strikerRole === myRole;
  const isKeeper = !isStriker;
  const result = sync.state === "ROUND_RESULT" ? lastRoundResult : null;
  const prompt = isStriker ? "Wybierz miejsce strzału" : "Wybierz miejsce obrony";
  const zoneRole = isStriker ? "striker" : "keeper";

  return (
    <motion.main initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.38, ease: "easeOut" }} className={screenClass} data-testid="game-screen">
      <GameHud currentRound={sync.currentRound} totalRounds={sync.totalRounds} scores={sync.scores} myRole={myRole} isStriker={isStriker} />
      <PenaltyScene isStriker={isStriker} myZone={myZone} result={result} zoneRole={zoneRole} hasChosen={hasChosen} onSelectZone={selectZone} />
      <section className="flex flex-none flex-col items-center gap-[clamp(0.35rem,1vh,0.9rem)] rounded-t-2xl border-t-4 border-gray-300 bg-[#f8fafc] px-[clamp(0.75rem,2vw,3rem)] pb-[clamp(0.75rem,2vh,1.75rem)] pt-[clamp(0.5rem,1.4vh,1.25rem)] text-blue-950 shadow-[0_-4px_0_rgba(23,37,84,0.12)]">
        {result ? (
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.32, ease: [0.2, 1.4, 0.4, 1] }} className="flex w-full max-w-[1400px] flex-wrap items-center justify-center gap-[clamp(0.6rem,2vw,2.5rem)]" data-testid="round-result">
            <div className="flex gap-[clamp(0.5rem,1.5vw,1.5rem)]">
              <div className="flex min-w-[clamp(140px,16vw,280px)] flex-col items-start rounded-2xl border-2 border-red-900 bg-red-500 px-[clamp(0.6rem,1.4vw,1.25rem)] py-[clamp(0.3rem,1vh,0.75rem)] text-white shadow-[0_3px_0_#7f1010]"><span className="font-['Baloo_2'] text-[clamp(0.55rem,0.95vw,0.95rem)] font-semibold tracking-[0.2em] opacity-80">NAPASTNIK</span><span className="font-['Anton'] text-[clamp(0.95rem,1.8vw,1.8rem)] tracking-[0.04em]" data-testid="result-striker-zone">{result.strikerZone}. {getZoneName(result.strikerZone)}</span></div>
              <div className="flex min-w-[clamp(140px,16vw,280px)] flex-col items-start rounded-2xl border-2 border-blue-900 bg-blue-500 px-[clamp(0.6rem,1.4vw,1.25rem)] py-[clamp(0.3rem,1vh,0.75rem)] text-white shadow-[0_3px_0_#10225f]"><span className="font-['Baloo_2'] text-[clamp(0.55rem,0.95vw,0.95rem)] font-semibold tracking-[0.2em] opacity-80">BRAMKARZ</span><span className="font-['Anton'] text-[clamp(0.95rem,1.8vw,1.8rem)] tracking-[0.04em]" data-testid="result-keeper-zone">{result.keeperZone}. {getZoneName(result.keeperZone)}</span></div>
            </div>
            <div className="flex flex-col items-center gap-[0.15em] font-['Anton']"><span className="text-[clamp(1.1rem,2.4vw,2.4rem)] tracking-[0.06em] text-[#ffd60a]" data-testid="result-points">{result.result.pointsAwarded > 0 ? `+${result.result.pointsAwarded} PKT — ${ROLE_LABEL[result.strikerRole]}` : "BEZ PUNKTÓW"}</span><span className="text-[clamp(0.8rem,1.5vw,1.5rem)] tracking-[0.12em] opacity-80" data-testid="result-score">{ROLE_LABEL.player_1} {result.scores.player_1} — {result.scores.player_2} {ROLE_LABEL.player_2}</span></div>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-center gap-[clamp(0.5rem,2vw,2rem)] text-center"><p className="m-0 font-['Anton'] text-[clamp(0.95rem,2vw,2rem)] uppercase tracking-[0.08em] text-blue-950" data-testid="prompt">{hasChosen ? "Twój wybór zapisany. Czekaj na rywala..." : prompt}</p><motion.p animate={rivalChosen ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.55 }} transition={rivalChosen ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }} className={`m-0 rounded-2xl border-2 px-4 py-2 font-['Baloo_2'] text-[clamp(0.7rem,1.2vw,1.15rem)] font-semibold uppercase tracking-[0.1em] ${rivalChosen ? "border-green-900 bg-green-500 text-white" : "border-gray-300 bg-white text-gray-500"}`} data-testid="rival-status">{rivalChosen ? "Rywal podjął decyzję." : "Rywal jeszcze wybiera..."}</motion.p></div>
            <p className="m-0 rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 font-['Baloo_2'] text-[clamp(0.6rem,1vw,0.95rem)] font-semibold uppercase tracking-[0.12em] text-green-900/65" aria-hidden="true">{isKeeper ? "Trafisz w strefę napastnika — obronisz karnego" : "Góra: 2 pkt, większe ryzyko. Dół: 1 pkt, pewniej"}</p>
          </>
        )}
      </section>
    </motion.main>
  );
}
