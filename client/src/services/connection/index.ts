import { mockConnection } from "./mockConnection";
import { createSocketConnection } from "./socketConnection";

// Куда подключаться: явный VITE_WS_URL → он; prod-сборка без него → тот же
// адрес, с которого открыта страница (клиент раздаёт сам сервер на :3000,
// так в сборку не «вшивается» IP стенда); dev без него → заглушка.
export function resolveServerUrl(): string | undefined {
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (wsUrl) return wsUrl;
  return import.meta.env.PROD ? window.location.origin : undefined;
}

export function createConnection() {
  const url = resolveServerUrl();
  return url ? createSocketConnection(url) : mockConnection;
}
