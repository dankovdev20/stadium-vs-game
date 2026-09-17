import { useGameEmit, useGameState, useConnectionStatus } from "../game/GameContext";

export function DevPanel() {
  const state = useGameState();
  const emit = useGameEmit();
  const status = useConnectionStatus();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed left-2 top-2 z-50 w-72 rounded-lg bg-black/85 p-3 text-xs text-white">
      {/* Статус подключения */}
      <div className="mb-2 flex items-center gap-2 border-b border-white/20 pb-2">
        <span className={`h-2 w-2 rounded-full ${status.connected ? "bg-green-400" : "bg-red-500"}`} />
        <span className="font-bold">{status.connected ? "Połączono" : "Rozłączono"}</span>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5">
          {status.usingMock ? "MOCK" : "SERWER"}
        </span>
      </div>
      {status.socketId && <div className="mb-1 text-white/60">id: {status.socketId}</div>}
      {status.lastError && <div className="mb-2 text-red-400">błąd: {status.lastError}</div>}

      {/* Реальные клиентские события */}
      <div className="mb-2 flex flex-col gap-1">
        <div className="font-bold text-white/70">player:select_role</div>
        <div className="flex gap-1">
          <button onClick={() => emit("player:select_role", "player_1")} className="flex-1 rounded bg-white/10 px-2 py-1 hover:bg-white/20">
            Gracz 1
          </button>
          <button onClick={() => emit("player:select_role", "player_2")} className="flex-1 rounded bg-white/10 px-2 py-1 hover:bg-white/20">
            Gracz 2
          </button>
        </div>

        <button
          onClick={() => emit("character:submit", { headId: 1, bodyId: 1, legsId: 1 })}
          className="rounded bg-white/10 px-2 py-1 text-left hover:bg-white/20"
        >
          character:submit (dummy)
        </button>

        <div className="mt-1 font-bold text-white/70">game:choose_zone</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((z) => (
            <button key={z} onClick={() => emit("game:choose_zone", z)} className="flex-1 rounded bg-white/10 py-1 hover:bg-white/20">
              {z}
            </button>
          ))}
        </div>

        <button onClick={() => emit("game:restart")} className="mt-1 rounded bg-white/10 px-2 py-1 text-left hover:bg-white/20">
          game:restart
        </button>
        <button onClick={() => emit("room:force_reset")} className="rounded bg-red-500/30 px-2 py-1 text-left hover:bg-red-500/50">
          room:force_reset (полный сброс)
        </button>
      </div>

      <pre className="max-h-40 overflow-auto border-t border-white/20 pt-1 text-[10px] text-white/60">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}