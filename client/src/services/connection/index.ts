import { mockConnection } from "./mockConnection";
import { createSocketConnection } from "./socketConnection";

export function createConnection() {
  const wsUrl = import.meta.env.VITE_WS_URL as string | undefined;
  return wsUrl ? createSocketConnection(wsUrl) : mockConnection;
}