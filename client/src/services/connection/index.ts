import { mockConnection } from "./mockConnection";
// import { createSocketConnection } from "./socketConnection"; // раскомментировать когда бэкенд готов

export function createConnection() {
  return mockConnection;
  // return createSocketConnection(import.meta.env.VITE_WS_URL);
}