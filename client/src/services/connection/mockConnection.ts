import { type GameConnection } from "./types";

type Handler = (payload?: any) => void;

class MockConnection implements GameConnection {
  private listeners = new Map<string, Set<Handler>>();

  connect() {
    // имитация: через секунду "приходит" второй игрок
    setTimeout(() => this.trigger("player:joined", { role: "player_1" }), 50000);
  }

  disconnect() {}

  on(event: string, handler: Handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: Handler) {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, payload?: any) {
    // клиент "отправляет на сервер" — в моке просто логируем,
    // либо тут же имитируем ответ (например, на zone:pick ответить round:reveal)
    console.log("[mock] client emit:", event, payload);

    if (event === "game:search") {
      setTimeout(() => {
        // Сервер нашел комнату и назначил роль -> отправляем событие на клиент
        this.trigger("player:joined", { role: "player_1" });
      }, 500);
    }
    
    if (event === "zone:pick") {
      setTimeout(
        () => this.trigger("round:reveal", { attackZone: 2, defenseZone: 4, scored: true }),
        800
      );
    }
  }

  // ⚠️ метод только для DevPanel — форсировать любое событие вручную
  trigger(event: string, payload?: any) {
    this.listeners.get(event)?.forEach((h) => h(payload));
  }
}

export const mockConnection = new MockConnection();