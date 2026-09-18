import { type GameConnection } from "./types";
import type { StateSyncPayload, PlayerRole } from "../../game/types";

type Handler = (payload?: any) => void;

class MockConnection implements GameConnection {
  private listeners = new Map<string, Set<Handler>>();
  private myRole: PlayerRole | null = null;
  private sync: StateSyncPayload = {
    state: "LOBBY",
    currentRound: 1,
    totalRounds: 10,
    strikerRole: "player_1",
    keeperRole: "player_2",
    slots: { player_1_taken: false, player_2_taken: false },
    choicesStatus: { player_1_chosen: false, player_2_chosen: false },
    scores: { player_1: 0, player_2: 0 },
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
    if (event === "character:submit") return this.submitCharacter();
    if (event === "game:choose_zone") return this.chooseZone(payload);
    if (event === "game:restart") return this.restart();
    if (event === "room:force_reset") return this.hardReset();
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

  private submitCharacter() {
    setTimeout(() => {
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

  private restart() {
    this.sync = { ...this.sync, state: "CUSTOMIZATION", currentRound: 1, scores: { player_1: 0, player_2: 0 } };
    this.pushSync();
  }

  private hardReset() {
    this.myRole = null;
    this.sync = {
      state: "LOBBY", currentRound: 1, totalRounds: 10,
      strikerRole: "player_1", keeperRole: "player_2",
      slots: { player_1_taken: false, player_2_taken: false },
      choicesStatus: { player_1_chosen: false, player_2_chosen: false },
      scores: { player_1: 0, player_2: 0 },
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