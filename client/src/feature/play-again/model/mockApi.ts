import type { GameResultData } from "./types";

// TODO: заменить на реальный запрос, когда будет готов бэкенд.
// Сигнатура остаётся той же, поэтому usePlayAgainModal менять не придётся:
// export async function fetchGameResult() {
//   return api.get<GameResultData>("/game/result").then(r => r.data);
// }
export async function fetchGameResult(): Promise<GameResultData> {
  return {
    isWinner: false,
    winnerName: "Player 1",
    readyCount: 1,
    totalPlayers: 2,
    duration: 10,
  };
}