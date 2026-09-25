import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { gameReducer } from "./gameReducer";
import { createConnection } from "../services/connection";
import type { GameConnection } from "../services/connection/types";
import { type GameState, type ServerAction, type GamePhase, initialGameState } from "./types";
import { clearSession, loadSession, saveSession } from "./session";

const EVENT_TYPES = [
  "state:sync", "role:assigned", "round:choice_made",
  "round:resolved", "game:over", "room:player_disconnected",
  "room:player_reconnected", "room:hard_reset", "room:error",
] as const;

// Сколько ждём ответа на player:reconnect, прежде чем перестать считать
// "сессия восстанавливается" (старый сервер без реконнекта молчит в ответ).
const RESTORE_TIMEOUT_MS = 3000;

interface ConnectionStatus {
  connected: boolean;
  /** Отправили player:reconnect и ждём role:assigned / RECONNECT_FAILED. */
  restoring: boolean;
  /** Сколько раз сокет подключался — для key экранов с локальным стейтом (см. App). */
  connectCount: number;
  socketId?: string;
  lastError?: string;
  usingMock: boolean;
}

const GameStateContext = createContext<GameState | null>(null);
const GameEmitContext = createContext<((event: string, payload?: any) => void) | null>(null);
const ConnectionStatusContext = createContext<ConnectionStatus>({ connected: false, restoring: false, connectCount: 0, usingMock: true });

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const usingMock = !import.meta.env.VITE_WS_URL;
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false, restoring: false, connectCount: 0, usingMock });

  // ⚠️ лениво, а не в аргументе useRef — иначе createConnection() дёргается на каждый рендер
  const connectionRef = useRef<GameConnection | null>(null);
  if (!connectionRef.current) {
    connectionRef.current = createConnection();
  }

  useEffect(() => {
    const connection = connectionRef.current!;
    let restoreTimer: ReturnType<typeof setTimeout> | null = null;

    const stopRestoring = () => {
      if (restoreTimer) clearTimeout(restoreTimer);
      restoreTimer = null;
      setStatus((s) => (s.restoring ? { ...s, restoring: false } : s));
    };

    // Побочные эффекты вокруг сессии живут здесь, а не в редьюсере (он чистый).
    const beforeDispatch: Partial<Record<(typeof EVENT_TYPES)[number], (payload?: any) => any>> = {
      "role:assigned": (payload) => {
        if (payload?.sessionToken) saveSession({ role: payload.role, sessionToken: payload.sessionToken });
        stopRestoring();
        return payload;
      },
      "room:hard_reset": (payload) => {
        clearSession();
        return payload;
      },
      "room:error": (payload) => {
        if (payload?.code === "RECONNECT_FAILED") {
          clearSession();
          stopRestoring();
        }
        return payload;
      },
      "room:player_disconnected": (payload) => payload && { ...payload, receivedAt: Date.now() },
    };

    const domainHandlers = EVENT_TYPES.map((type) => {
      const handler = (payload?: any) => {
        const prepared = beforeDispatch[type] ? beforeDispatch[type]!(payload) : payload;
        dispatch({ type, payload: prepared } as ServerAction);
      };
      connection.on(type, handler);
      return { type, handler };
    });

    // На КАЖДОЕ подключение (первое после F5 и любое авто-переподключение
    // socket.io после обрыва) пробуем вернуть свою роль. Без этого сервер
    // через 10с считает игрока ушедшим и сбрасывает матч обоим.
    const onConnect = () => {
      setStatus((s) => ({
        ...s,
        connected: true,
        connectCount: s.connectCount + 1,
        socketId: connection.getId?.(),
        lastError: undefined,
      }));
      const session = loadSession();
      if (!session) return;
      setStatus((s) => ({ ...s, restoring: true }));
      if (restoreTimer) clearTimeout(restoreTimer);
      restoreTimer = setTimeout(stopRestoring, RESTORE_TIMEOUT_MS);
      connection.emit("player:reconnect", session);
    };
    const onDisconnect = () => setStatus((s) => ({ ...s, connected: false }));
    const onConnectError = (err: any) =>
      setStatus((s) => ({ ...s, connected: false, lastError: err?.message ?? String(err) }));

    connection.on("connect", onConnect);
    connection.on("disconnect", onDisconnect);
    connection.on("connect_error", onConnectError);
    connection.connect();

    return () => {
      if (restoreTimer) clearTimeout(restoreTimer);
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
