import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { gameReducer } from "./gameReducer";
import { createConnection } from "../services/connection";
import type { GameConnection } from "../services/connection/types";
import { type GameState, type ServerAction, type GamePhase, initialGameState } from "./types";

const EVENT_TYPES = [
  "state:sync", "role:assigned", "round:choice_made",
  "round:resolved", "game:over", "room:player_disconnected",
  "room:hard_reset", "room:error",
] as const;

interface ConnectionStatus {
  connected: boolean;
  socketId?: string;
  lastError?: string;
  usingMock: boolean;
}

const GameStateContext = createContext<GameState | null>(null);
const GameEmitContext = createContext<((event: string, payload?: any) => void) | null>(null);
const ConnectionStatusContext = createContext<ConnectionStatus>({ connected: false, usingMock: true });

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const usingMock = !import.meta.env.VITE_WS_URL;
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false, usingMock });

  // ⚠️ лениво, а не в аргументе useRef — иначе createConnection() дёргается на каждый рендер
  const connectionRef = useRef<GameConnection | null>(null);
  if (!connectionRef.current) {
    connectionRef.current = createConnection();
  }

  useEffect(() => {
    const connection = connectionRef.current!;

    const domainHandlers = EVENT_TYPES.map((type) => {
      const handler = (payload?: any) => dispatch({ type, payload } as ServerAction);
      connection.on(type, handler);
      return { type, handler };
    });

    const onConnect = () => setStatus((s) => ({ ...s, connected: true, socketId: connection.getId?.(), lastError: undefined }));
    const onDisconnect = () => setStatus((s) => ({ ...s, connected: false }));
    const onConnectError = (err: any) =>
      setStatus((s) => ({ ...s, connected: false, lastError: err?.message ?? String(err) }));

    connection.on("connect", onConnect);
    connection.on("disconnect", onDisconnect);
    connection.on("connect_error", onConnectError);
    connection.connect();

    return () => {
      domainHandlers.forEach(({ type, handler }) => connection.off(type, handler));
      connection.off("connect", onConnect);
      connection.off("disconnect", onDisconnect);
      connection.off("connect_error", onConnectError);
      connection.disconnect();
    };
  }, []);

  const emit = (event: string, payload?: any) => connectionRef.current!.emit(event, payload);

  return (
    <GameStateContext.Provider value={state}>
      <GameEmitContext.Provider value={emit}>
        <ConnectionStatusContext.Provider value={status}>{children}</ConnectionStatusContext.Provider>
      </GameEmitContext.Provider>
    </GameStateContext.Provider>
  );
}

export const useGameState = () => useContext(GameStateContext)!;
export const useGameEmit = () => useContext(GameEmitContext)!;
export const useConnectionStatus = () => useContext(ConnectionStatusContext);

export function useGamePhase(): GamePhase {
  const { sync } = useGameState();
  return sync?.state ?? "LOBBY";
}