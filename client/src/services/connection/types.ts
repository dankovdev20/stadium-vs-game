export interface GameConnection {
  connect(): void;
  disconnect(): void;
  on(event: string, handler: (payload?: any) => void): void;
  off(event: string, handler: (payload?: any) => void): void;
  emit(event: string, payload?: any): void;
}