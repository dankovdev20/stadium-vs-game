import { type GameState, type ServerAction, initialGameState } from "./types";

export function gameReducer(state: GameState, action: ServerAction): GameState {
  switch (action.type) {
    case "state:sync":
      return { ...state, sync: action.payload };
    case "role:assigned":
      return { ...state, myRole: action.payload!.role };
    case "round:choice_made":
      return { ...state, lastChoiceMade: action.payload };
    case "round:resolved":
      return { ...state, lastRoundResult: action.payload };
    case "game:over":
      return { ...state, lastGameOver: action.payload };
    case "room:player_disconnected":
      return { ...state, disconnectedInfo: action.payload };
    case "room:error":
      return { ...state, lastError: action.payload };
    case "room:hard_reset":
      return { ...initialGameState }; // ⚠️ важно: myRole тоже обнуляется, как требует спека
    default:
      return state;
  }
}