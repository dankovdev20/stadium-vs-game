// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { GameRoom } from './src/gameRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Игра для киосков — собранный клиент (`cd client && npm run build`).
// Тестовая панель сервера переехала на /debug.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist));
} else {
    console.warn(`[stand] Brak zbudowanego klienta w ${clientDist} — uruchom "npm run build" w client/.`);
}
app.use('/debug', express.static(path.join(__dirname, 'public')));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const room = new GameRoom(io);

// Одна ошибка в логике комнаты не должна ронять весь стенд: логируем и
// продолжаем обслуживать остальные события.
function safe(eventName, handler) {
    return (...args) => {
        try {
            handler(...args);
        } catch (err) {
            console.error(`[stand] Błąd w obsłudze "${eventName}":`, err);
        }
    };
}

io.on('connection', (socket) => {
    room.broadcastState();

    const on = (event, handler) => socket.on(event, safe(event, handler));

    // 1. Выбор роли в лобби
    on('player:select_role', (role) => {
        room.handleSelectRole(socket, role);
    });

    // 2. Сборка персонажа
    on('character:submit', (characterData) => {
        room.handleCharacterReady(socket, characterData);
    });

    // 3. Выбор зоны
    on('game:choose_zone', (zoneId) => {
        room.handleMakeChoice(socket, Number(zoneId));
    });

    // 4. Мягкий рестарт после матча (в CUSTOMIZATION) — теперь голосование обоих игроков, см. server/TASKS_FOR_BACKEND.md
    on('game:restart', () => {
        room.handleRestartGame(socket);
    });

    // 5. Полный сброс (в LOBBY)
    on('room:force_reset', () => {
        room.handleForceReset();
    });

    // 6. Восстановление сессии при реконнекте сокета
    on('player:reconnect', (payload) => {
        room.handleReconnect(socket, payload);
    });

    on('disconnect', () => {
        room.handleDisconnect(socket);
    });
});

// Последняя линия обороны (например, ошибка в колбэке таймера комнаты).
// Процесс завершаем — его перезапустит супервизор (`npm start`, scripts/supervise.js).
process.on('uncaughtException', (err) => {
    console.error('[stand] uncaughtException:', err);
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error('[stand] unhandledRejection:', err);
});

const PORT = Number(process.env.PORT) || 3000;

// Адреса в локальной сети — их открывают киоски (http://IP:PORT).
function lanAddresses() {
    return Object.values(os.networkInterfaces())
        .flat()
        .filter((net) => net && net.family === 'IPv4' && !net.internal)
        .map((net) => net.address);
}

// Порт занят (обычно — уже запущен другой сервер игры). Код 2 = не
// перезапускать: супервизор всё равно упрётся в тот же занятый порт.
const EXIT_PORT_IN_USE = 2;
httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[stand] Port ${PORT} jest zajęty — serwer gry już działa? Zamknij go albo użyj PORT=inny npm start.`);
        process.exit(EXIT_PORT_IN_USE);
    }
    throw err;
});

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
    const addresses = lanAddresses();
    if (addresses.length === 0) {
        console.warn('[stand] Brak adresu w sieci lokalnej — komputer nie jest podłączony do sieci.');
    }
    for (const address of addresses) {
        console.log(`  Kiosk: http://${address}:${PORT}   (panel testowy: /debug)`);
    }
});
