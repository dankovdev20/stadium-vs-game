import { type GameState, type ServerAction, initialGameState } from "./types";

export function gameReducer(state: GameState, action: ServerAction): GameState {
  switch (action.type) {
    case "state:sync":
      return { ...state, sync: action.payload };
    case "role:assigned":
      return { ...state, myRole: action.payload.role };
    case "round:choice_made":
      return { ...state, lastChoiceMade: action.payload };
    case "round:resolved":
      return { ...state, lastRoundResult: action.payload };
    case "game:over":
      return { ...state, lastGameOver: action.payload };
    case "room:player_disconnected":
      return { ...state, disconnectedInfo: action.payload };
    case "room:player_reconnected":
      return state.disconnectedInfo?.role === action.payload.role ? { ...state, disconnectedInfo: null } : state;
    case "room:error":
      // RECONNECT_FAILED — сервер нашу сессию уже не знает (сброс по таймауту
      // или рестарт сервера): роль, которую мы помним, больше не наша.
      return action.payload?.code === "RECONNECT_FAILED"
        ? { ...state, myRole: null, lastError: action.payload }
        : { ...state, lastError: action.payload };
    case "room:hard_reset":
      // ⚠️ важно: myRole тоже обнуляется, как требует спека. resetEpoch — единственное,
      // что переживает сброс (см. types.ts).
      return { ...initialGameState, resetEpoch: state.resetEpoch + 1 };
    default:
      return state;
  }
}
