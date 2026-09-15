import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { gameReducer, initialGameState } from "./gameReducer";
import { createConnection } from "../services/connection";
import { type GameState, type ServerEvent } from "./types";

const EVENT_TYPES: ServerEvent["type"][] = [
  "player:joined", "room:full", "game:start", "round:pick_phase",
  "round:reveal", "player:disconnected", "player:reconnected", "game:end",
];

const GameStateContext = createContext<GameState | null>(null);
const GameEmitContext = createContext<((event: string, payload?: any) => void) | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const connectionRef = useRef(createConnection());

  useEffect(() => {
    const connection = connectionRef.current;
    const handlers = EVENT_TYPES.map((type) => {
      const handler = (payload?: any) => dispatch({ type, payload } as ServerEvent);
      connection.on(type, handler);
      return { type, handler };
    });
    connection.connect();

    return () => {
      handlers.forEach(({ type, handler }) => connection.off(type, handler));
      connection.disconnect();
    };
  }, []);

  const emit = (event: string, payload?: any) => connectionRef.current.emit(event, payload);

  return (
    <GameStateContext.Provider value={state}>
      <GameEmitContext.Provider value={emit}>{children}</GameEmitContext.Provider>
    </GameStateContext.Provider>
  );
}

export const useGameState = () => useContext(GameStateContext)!;
export const useGameEmit = () => useContext(GameEmitContext)!;