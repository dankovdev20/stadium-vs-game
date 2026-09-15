export type GamePhase =
  | "start"
  | "connecting"
  | "lobby"
  | "pick"
  | "reveal"
  | "result"
  | "disconnected";

export interface GameState {
  phase: GamePhase;
  role: "player_1" | "player_2" | null;
  score: { player_1: number; player_2: number };
  lastRound: { attackZone: number; defenseZone: number; scored: boolean } | null;
}

// события, которые прилетают "с сервера" (мок или реальный сокет — не важно)
export type ServerEvent =
  | { type: "player:joined"; payload: { role: "player_1" | "player_2" } }
  | { type: "room:full" }
  | { type: "game:start" }
  | { type: "round:pick_phase" }
  | { type: "round:reveal"; payload: { attackZone: number; defenseZone: number; scored: boolean } }
  | { type: "player:disconnected" }
  | { type: "player:reconnected" }
  | { type: "game:end" };