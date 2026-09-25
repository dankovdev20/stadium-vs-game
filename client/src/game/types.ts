export type GamePhase =
  | "LOBBY"
  | "CUSTOMIZATION"
  | "PLAYING"
  | "ROUND_RESULT"
  | "GAME_OVER"
  | "PAUSED_DISCONNECT";

export type PlayerRole = "player_1" | "player_2";

export interface RestartVoteStatus {
  player_1_ready: boolean;
  player_2_ready: boolean;
  // epoch ms, когда откроется таймаут "Играть снова" -> LOBBY. null вне GAME_OVER.
  deadline: number | null;
}

// Канонический тип payload'а character:submit — единственный источник
// правды для формы сборки персонажа (голова/торс/ноги). Переиспользуется
// и конструктором (feature/character-builder), и сценой матча (GameScreen).
export interface CharacterSelection {
  headId: number;
  bodyId: number;
  legsId: number;
}

export interface StateSyncPayload {
  state: GamePhase;
  currentRound: number;
  totalRounds: number;
  strikerRole: PlayerRole;
  keeperRole: PlayerRole;
  slots: { player_1_taken: boolean; player_2_taken: boolean };
  choicesStatus: { player_1_chosen: boolean; player_2_chosen: boolean };
  scores: { player_1: number; player_2: number };
  characters: { player_1: CharacterSelection | null; player_2: CharacterSelection | null };
  restart: RestartVoteStatus;
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

export interface RoleAssignedPayload {
  role: PlayerRole;
  sessionToken: string;
  reconnected?: boolean;
}

export interface GameState {
  sync: StateSyncPayload | null;          // последний state:sync целиком
  myRole: PlayerRole | null;               // из role:assigned
  lastChoiceMade: { role: PlayerRole; strikerRole: PlayerRole; keeperRole: PlayerRole } | null;
  lastRoundResult: RoundResolvedPayload | null;
  lastGameOver: { winner: PlayerRole | "REMIS"; scores: { player_1: number; player_2: number } } | null;
  // receivedAt ставит GameContext в момент прихода события (редьюсер чистый) —
  // от него баннер считает живой обратный отсчёт до сброса.
  disconnectedInfo: { role: PlayerRole; timeoutSec: number; receivedAt: number } | null;
  lastError: { code: "ROLE_TAKEN" | "RECONNECT_FAILED"; message: string } | null;
  // Растёт на каждый room:hard_reset. App вешает его как key на экраны, чтобы
  // их локальный стейт (например оптимистичный выбор роли в лобби) гарантированно
  // умирал вместе со сбросом, даже если фаза до и после сброса одна и та же (LOBBY).
  resetEpoch: number;
}

export const initialGameState: GameState = {
  sync: null, myRole: null, lastChoiceMade: null,
  lastRoundResult: null, lastGameOver: null,
  disconnectedInfo: null, lastError: null,
  resetEpoch: 0,
};

export type ServerAction =
  | { type: "state:sync"; payload: StateSyncPayload }
  | { type: "role:assigned"; payload: RoleAssignedPayload }
  | { type: "round:choice_made"; payload: GameState["lastChoiceMade"] }
  | { type: "round:resolved"; payload: RoundResolvedPayload }
  | { type: "game:over"; payload: GameState["lastGameOver"] }
  | { type: "room:player_disconnected"; payload: GameState["disconnectedInfo"] }
  | { type: "room:player_reconnected"; payload: { role: PlayerRole } }
  | { type: "room:hard_reset" }
  | { type: "room:error"; payload: GameState["lastError"] };