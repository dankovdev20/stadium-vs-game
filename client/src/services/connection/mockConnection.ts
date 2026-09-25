import { type GameConnection } from "./types";
import type { StateSyncPayload, PlayerRole, CharacterSelection } from "../../game/types";

type Handler = (payload?: any) => void;

const RESTART_VOTE_TIMEOUT_MS = 10000;
// Заглушка для персонажа "соперника", которого эмулирует мок (см. selectRole).
const FALLBACK_CHARACTER: CharacterSelection = { headId: 1, bodyId: 1, legsId: 1 };

class MockConnection implements GameConnection {
  private listeners = new Map<string, Set<Handler>>();
  private myRole: PlayerRole | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private sync: StateSyncPayload = {
    state: "LOBBY",
    currentRound: 1,
    totalRounds: 10,
    strikerRole: "player_1",
    keeperRole: "player_2",
    slots: { player_1_taken: false, player_2_taken: false },
    choicesStatus: { player_1_chosen: false, player_2_chosen: false },
    scores: { player_1: 0, player_2: 0 },
    characters: { player_1: null, player_2: null },
    restart: { player_1_ready: false, player_2_ready: false, deadline: null },
  };

  connect() {
    setTimeout(() => this.trigger("connect"), 50);
  }

  disconnect() {
    this.trigger("disconnect");
  }

  getId() {
    return "mock-socket";
  }

  on(event: string, handler: Handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: Handler) {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, payload?: any) {
    console.log("[mock] emit:", event, payload);
    if (event === "player:select_role") return this.selectRole(payload);
    if (event === "character:submit") return this.submitCharacter(payload);
    if (event === "game:choose_zone") return this.chooseZone(payload);
    if (event === "game:restart") return this.restart();
    if (event === "room:force_reset") return this.hardReset();
    if (event === "player:reconnect") return this.reconnect(payload);
  }

  // Мок живёт в памяти вкладки и умирает вместе с F5 — сессию после
  // перезагрузки он восстановить не может, ведёт себя как сервер после рестарта.
  private reconnect(payload?: { role?: PlayerRole }) {
    if (this.myRole && payload?.role === this.myRole) {
      this.trigger("role:assigned", { role: this.myRole, sessionToken: "mock", reconnected: true });
      return;
    }
    this.trigger("room:error", { code: "RECONNECT_FAILED", message: "Nieprawidłowy token sesji lub pokój został zresetowany." });
  }

  private selectRole(role: PlayerRole) {
    this.myRole = role;
    this.trigger("role:assigned", { role });
    this.sync.slots[`${role}_taken`] = true;

    const other: PlayerRole = role === "player_1" ? "player_2" : "player_1";
    if (!this.sync.slots[`${other}_taken`]) {
      setTimeout(() => {
        this.sync.slots[`${other}_taken`] = true;
        this.sync.state = "CUSTOMIZATION";
        this.pushSync();
      }, 1000);
    }
    this.pushSync();
  }

  private submitCharacter(character: CharacterSelection) {
    if (!this.myRole) return;
    this.sync.characters = { ...this.sync.characters, [this.myRole]: character };
    this.pushSync();

    const other: PlayerRole = this.myRole === "player_1" ? "player_2" : "player_1";
    setTimeout(() => {
      this.sync.characters = { ...this.sync.characters, [other]: FALLBACK_CHARACTER };
      this.sync.state = "PLAYING";
      this.pushSync();
    }, 800);
  }

  private chooseZone(zone: number) {
    if (!this.myRole) return;
    this.sync.choicesStatus[`${this.myRole}_chosen`] = true;
    this.trigger("round:choice_made", {
      role: this.myRole,
      strikerRole: this.sync.strikerRole,
      keeperRole: this.sync.keeperRole,
    });
    this.pushSync();

    setTimeout(() => {
      const isGoal = Math.random() < 0.7;
      const points = isGoal ? (zone <= 3 ? 2 : 1) : 0;
      if (isGoal) this.sync.scores[this.sync.strikerRole] += points;

      this.sync.state = "ROUND_RESULT";
      this.trigger("round:resolved", {
        round: this.sync.currentRound,
        strikerRole: this.sync.strikerRole,
        keeperRole: this.sync.keeperRole,
        strikerZone: zone,
        keeperZone: zone,
        result: { isGoal, pointsAwarded: points, outcome: isGoal ? "GOL" : "OBRONA_PERFEKCYJNA", details: "Symulacja lokalna" },
        scores: this.sync.scores,
      });
      this.pushSync();

      setTimeout(() => {
        this.sync.currentRound += 1;
        this.sync.choicesStatus = { player_1_chosen: false, player_2_chosen: false };
        [this.sync.strikerRole, this.sync.keeperRole] = [this.sync.keeperRole, this.sync.strikerRole];

        if (this.sync.currentRound > this.sync.totalRounds) {
          this.sync.state = "GAME_OVER";
          this.sync.restart = { player_1_ready: false, player_2_ready: false, deadline: Date.now() + RESTART_VOTE_TIMEOUT_MS };
          this.restartTimer = setTimeout(() => this.hardReset(), RESTART_VOTE_TIMEOUT_MS);
          const { player_1, player_2 } = this.sync.scores;
          const winner = player_1 === player_2 ? "REMIS" : player_1 > player_2 ? "player_1" : "player_2";
          this.trigger("game:over", { winner, scores: this.sync.scores });
        } else {
          this.sync.state = "PLAYING";
        }
        this.pushSync();
      }, 4000);
    }, 600);
  }

  // Голос за рестарт: как и на сервере, нужны ОБА. Второго игрока эмулируем
  // (как и подсадку в лобби) — сама механика "ждём обоих / иначе таймаут"
  // остаётся честной для соло-разработчика.
  private restart() {
    if (!this.myRole || this.sync.state !== "GAME_OVER") return;
    if (this.sync.restart[`${this.myRole}_ready`]) return;

    this.sync.restart = { ...this.sync.restart, [`${this.myRole}_ready`]: true };
    this.pushSync();

    const other: PlayerRole = this.myRole === "player_1" ? "player_2" : "player_1";
    if (this.sync.restart[`${other}_ready`]) {
      this.confirmRestart();
    } else {
      setTimeout(() => {
        if (this.sync.state !== "GAME_OVER") return;
        this.sync.restart = { ...this.sync.restart, [`${other}_ready`]: true };
        this.pushSync();
        this.confirmRestart();
      }, 800);
    }
  }

  private confirmRestart() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    this.sync = {
      ...this.sync,
      state: "CUSTOMIZATION",
      currentRound: 1,
      scores: { player_1: 0, player_2: 0 },
      characters: { player_1: null, player_2: null },
      restart: { player_1_ready: false, player_2_ready: false, deadline: null },
    };
    this.pushSync();
  }

  private hardReset() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    this.myRole = null;
    this.sync = {
      state: "LOBBY", currentRound: 1, totalRounds: 10,
      strikerRole: "player_1", keeperRole: "player_2",
      slots: { player_1_taken: false, player_2_taken: false },
      choicesStatus: { player_1_chosen: false, player_2_chosen: false },
      scores: { player_1: 0, player_2: 0 },
      characters: { player_1: null, player_2: null },
      restart: { player_1_ready: false, player_2_ready: false, deadline: null },
    };
    this.trigger("room:hard_reset");
    this.pushSync();
  }

  private pushSync() {
    this.trigger("state:sync", { ...this.sync });
  }

  private trigger(event: string, payload?: any) {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}

export const mockConnection = new MockConnection();