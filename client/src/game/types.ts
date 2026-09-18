export type GamePhase =
  | "LOBBY"
  | "CUSTOMIZATION"
  | "PLAYING"
  | "ROUND_RESULT"
  | "GAME_OVER"
  | "PAUSED_DISCONNECT";

export type PlayerRole = "player_1" | "player_2";

export interface StateSyncPayload {
  state: GamePhase;
  currentRound: number;
  totalRounds: number;
  strikerRole: PlayerRole;
  keeperRole: PlayerRole;
  slots: { player_1_taken: boolean; player_2_taken: boolean };
  choicesStatus: { player_1_chosen: boolean; player_2_chosen: boolean };
  scores: { player_1: number; player_2: number };
}

export type RoundOutcome =
  | "GOL" | "OBRONA_PERFEKCYJNA" | "OBRONA_NOGA"
  | "FUKS_BRAMKARZA" | "SLUPEK_POPRZECZKA" | "NAD_POPRZECZKA";

export interface RoundResolvedPayload {
  round: number;
  strikerRole: PlayerRole;
  keeperRole: PlayerRole;
  strikerZone: number;
  keeperZone: number;
  result: { isGoal: boolean; pointsAwarded: number; outcome: RoundOutcome; details: string };
  scores: { player_1: number; player_2: number };
}

export interface GameState {
  sync: StateSyncPayload | null;          // последний state:sync целиком
  myRole: PlayerRole | null;               // из role:assigned
  lastChoiceMade: { role: PlayerRole; strikerRole: PlayerRole; keeperRole: PlayerRole } | null;
  lastRoundResult: RoundResolvedPayload | null;
  lastGameOver: { winner: PlayerRole | "REMIS"; scores: { player_1: number; player_2: number } } | null;
  disconnectedInfo: { role: PlayerRole; timeoutSec: number } | null;
  lastError: { code: "ROLE_TAKEN" | "ROOM_FULL"; message: string } | null;
}

export const initialGameState: GameState = {
  sync: null, myRole: null, lastChoiceMade: null,
  lastRoundResult: null, lastGameOver: null,
  disconnectedInfo: null, lastError: null,
};

export type ServerAction =
  | { type: "state:sync"; payload: StateSyncPayload }
  | { type: "role:assigned"; payload: { role: PlayerRole } }
  | { type: "round:choice_made"; payload: GameState["lastChoiceMade"] }
  | { type: "round:resolved"; payload: RoundResolvedPayload }
  | { type: "game:over"; payload: GameState["lastGameOver"] }
  | { type: "room:player_disconnected"; payload: GameState["disconnectedInfo"] }
  | { type: "room:hard_reset" }
  | { type: "room:error"; payload: GameState["lastError"] };