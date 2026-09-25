// Полезная нагрузка событий приходит по сети — до разбора её тип неизвестен
// (unknown, не any): каждый потребитель сам приводит её к ожидаемому типу.
export type EventHandler = (payload?: unknown) => void;

export interface GameConnection {
  connect(): void;
  disconnect(): void;
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  emit(event: string, payload?: unknown): void;
  getId?: () => string | undefined;
}