import type { PlayerRole } from "./types";

// Сессия игрока для player:reconnect (см. shared/put_me_in_context.md, РАЗДЕЛ 7, п.9).
// sessionStorage, а не localStorage: живёт ровно в этой вкладке киоска и
// переживает F5/падение рендера, но две вкладки на одной машине (dev на
// 5173/5174) не делят одну сессию между собой.
const KEY = "stadium-vs:session";

export interface StoredSession {
  role: PlayerRole;
  sessionToken: string;
}

// try/catch везде: в инкогнито/при заблокированном хранилище доступ может
// бросить — игра должна работать и без реконнекта.
export function loadSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if ((parsed.role === "player_1" || parsed.role === "player_2") && typeof parsed.sessionToken === "string") {
      return { role: parsed.role, sessionToken: parsed.sessionToken };
    }
  } catch {
    /* хранилище недоступно или битое — просто нет сессии */
  }
  return null;
}

export function saveSession(session: StoredSession) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* см. loadSession */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* см. loadSession */
  }
}
