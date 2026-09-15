import { type GameState, type ServerEvent } from "./types";

export const initialGameState: GameState = {
  phase: "start",
  role: null,
  score: { player_1: 0, player_2: 0 },
  lastRound: null,
};

export function gameReducer(state: GameState, event: ServerEvent): GameState {
  switch (event.type) {
    case "player:joined":
      return { ...state, role: event.payload.role, phase: "lobby" };
    case "game:start":
      return { ...state, phase: "pick" };
    case "round:pick_phase":
      return { ...state, phase: "pick" };
    case "round:reveal":
      return {
        ...state,
        phase: "reveal",
        lastRound: event.payload,
        score: event.payload.scored
          ? { ...state.score, [state.role!]: state.score[state.role!] + 1 }
          : state.score,
      };
    case "player:disconnected":
      return { ...state, phase: "disconnected" };
    case "game:end":
      return { ...state, phase: "result" };
    default:
      return state;
  }
}