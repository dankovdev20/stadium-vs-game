import { io, Socket } from "socket.io-client";
import { type GameConnection } from "./types";

export function createSocketConnection(url: string): GameConnection {
  // autoConnect: false — сокет создаётся сразу, но не подключается,
  // пока мы явно не вызовем .connect(). Это важно: GameContext сначала
  // регистрирует все .on()-подписки, и только потом дёргает connect().
  const socket: Socket = io(url, { autoConnect: false, transports: ["websocket"] });

  return {
    connect: () => socket.connect(),
    disconnect: () => socket.disconnect(),
    on: (event, handler) => { socket.on(event, handler); },
    off: (event, handler) => { socket.off(event, handler); },
    emit: (event, payload) => { socket.emit(event, payload); },
    getId: () => socket.id,
  };
}