// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameRoom } from './src/gameRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const room = new GameRoom(io);

io.on('connection', (socket) => {
    room.broadcastState();

    // 1. Выбор роли в лобби
    socket.on('player:select_role', (role) => {
        room.handleSelectRole(socket, role);
    });

    // 2. Сборка персонажа
    socket.on('character:submit', (characterData) => {
        room.handleCharacterReady(socket, characterData);
    });

    // 3. Выбор зоны
    socket.on('game:choose_zone', (zoneId) => {
        room.handleMakeChoice(socket, Number(zoneId));
    });

    // 4. Мягкий рестарт после матча (в CUSTOMIZATION)
    socket.on('game:restart', () => {
        room.handleRestartGame();
    });

    // 5. Полный сброс (в LOBBY)
    socket.on('room:force_reset', () => {
        room.handleForceReset();
    });

    socket.on('disconnect', () => {
        room.handleDisconnect(socket);
    });
});

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});