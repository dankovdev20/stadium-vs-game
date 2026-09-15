import { mockConnection } from "../services/connection/mockConnection";
import { useGameState } from "../game/GameContext";

const PHASE_EVENTS: Record<string, [string, any?]> = {
  "→ start": ["phase:start", { role: null }],
  "→ lobby": ["player:joined", { role: "player_1" }],
  "→ pick": ["game:start"],
  "→ reveal (гол)": ["round:reveal", { attackZone: 2, defenseZone: 4, scored: true }],
  "→ reveal (промах)": ["round:reveal", { attackZone: 2, defenseZone: 2, scored: false }],
  "→ disconnected": ["player:disconnected"],
  "→ result": ["game:end"],
};

export function DevPanel() {
  const state = useGameState();
  if (!import.meta.env.DEV) return null; // не попадёт в прод-сборку

  return (
    <div className="fixed left-2 top-2 z-50 w-64 rounded-lg bg-black/80 p-3 text-xs text-white">
      <div className="mb-2 font-bold">DEV: текущая фаза — {state.phase}</div>
      <div className="flex flex-col gap-1">
        {Object.entries(PHASE_EVENTS).map(([label, [event, payload]]) => (
          <button
            key={label}
            onClick={() => mockConnection.trigger(event, payload)}
            className="rounded bg-white/10 px-2 py-1 text-left hover:bg-white/20"
          >
            {label}
          </button>
        ))}
      </div>
      <pre className="mt-2 max-h-32 overflow-auto text-[10px] text-white/60">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}