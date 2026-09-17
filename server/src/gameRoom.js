// src/gameRoom.js
import { resolveShot } from './gameRules.js';

export const GAME_STATES = {
    LOBBY: 'LOBBY',
    CUSTOMIZATION: 'CUSTOMIZATION',
    PLAYING: 'PLAYING',
    ROUND_RESULT: 'ROUND_RESULT',
    GAME_OVER: 'GAME_OVER',
    PAUSED_DISCONNECT: 'PAUSED_DISCONNECT'
};

const TOTAL_ROUNDS = 10;
const RECONNECT_TIMEOUT_MS = 10000;

export class GameRoom {
    constructor(io) {
        this.io = io;
        this.hardResetRoom();
    }

    // Полный сброс в самое начало (Лобби)
    hardResetRoom() {
        if (this.disconnectTimer) {
            clearTimeout(this.disconnectTimer);
            this.disconnectTimer = null;
        }
        this.state = GAME_STATES.LOBBY;
        this.players = {
            player_1: null,
            player_2: null
        };
        this.currentRound = 1;
        this.strikerRole = 'player_1';
        this.keeperRole = 'player_2';
        this.roundChoices = { player_1: null, player_2: null };
    }

    // 1. Выбор роли в лобби
    handleSelectRole(socket, requestedRole) {
        if (this.state !== GAME_STATES.LOBBY) return;
        if (requestedRole !== 'player_1' && requestedRole !== 'player_2') return;

        if (this.players[requestedRole] && this.players[requestedRole].isConnected) {
            socket.emit('room:error', { code: 'ROLE_TAKEN', message: 'Ta rola jest już zajęta!' });
            return;
        }

        socket.role = requestedRole;
        this.players[requestedRole] = {
            socketId: socket.id,
            ready: false,
            character: null,
            score: 0,
            isConnected: true
        };

        socket.emit('role:assigned', { role: requestedRole });

        // Если оба выбрали роли — сразу переходим к созданию персонажа
        if (this.players.player_1?.isConnected && this.players.player_2?.isConnected) {
            this.state = GAME_STATES.CUSTOMIZATION;
        }

        this.broadcastState();
    }

    // 2. Подтверждение персонажа
    handleCharacterReady(socket, characterData) {
        if (this.state !== GAME_STATES.CUSTOMIZATION) return;
        const player = this.players[socket.role];
        if (!player) return;

        player.character = characterData;
        player.ready = true;

        // Ждем обоих игроков
        if (this.players.player_1?.ready && this.players.player_2?.ready) {
            this.players.player_1.ready = false;
            this.players.player_2.ready = false;
            this.state = GAME_STATES.PLAYING;
            this.currentRound = 1;
            this.strikerRole = 'player_1';
            this.keeperRole = 'player_2';
            this.roundChoices = { player_1: null, player_2: null };
        }

        this.broadcastState();
    }

    // 3. Выбор зоны (1-5)
    handleMakeChoice(socket, zoneId) {
        if (this.state !== GAME_STATES.PLAYING) return;
        const role = socket.role;
        if (!role || !this.players[role]) return;
        if (zoneId < 1 || zoneId > 5) return;

        if (this.roundChoices[role] !== null) return; // Защита от спама

        this.roundChoices[role] = zoneId;

        this.io.emit('round:choice_made', {
            role,
            strikerRole: this.strikerRole,
            keeperRole: this.keeperRole
        });

        if (this.roundChoices.player_1 !== null && this.roundChoices.player_2 !== null) {
            this.resolveRound();
        }
    }

    resolveRound() {
        this.state = GAME_STATES.ROUND_RESULT;

        const strikerZone = this.roundChoices[this.strikerRole];
        const keeperZone = this.roundChoices[this.keeperRole];

        const result = resolveShot(strikerZone, keeperZone);

        if (result.isGoal) {
            this.players[this.strikerRole].score += result.pointsAwarded;
        }

        const payload = {
            round: this.currentRound,
            strikerRole: this.strikerRole,
            keeperRole: this.keeperRole,
            strikerZone,
            keeperZone,
            result,
            scores: {
                player_1: this.players.player_1.score,
                player_2: this.players.player_2.score
            }
        };

        this.io.emit('round:resolved', payload);
        this.broadcastState();

        setTimeout(() => {
            this.nextRound();
        }, 4000);
    }

    nextRound() {
        if (this.currentRound >= TOTAL_ROUNDS) {
            this.finishGame();
            return;
        }

        this.currentRound += 1;

        // Смена ролей (Нападающий <-> Вратарь)
        const temp = this.strikerRole;
        this.strikerRole = this.keeperRole;
        this.keeperRole = temp;

        this.roundChoices = { player_1: null, player_2: null };
        this.state = GAME_STATES.PLAYING;

        this.broadcastState();
    }

    finishGame() {
        this.state = GAME_STATES.GAME_OVER;
        const s1 = this.players.player_1?.score || 0;
        const s2 = this.players.player_2?.score || 0;

        let winner = 'REMIS';
        if (s1 > s2) winner = 'player_1';
        if (s2 > s1) winner = 'player_2';

        this.io.emit('game:over', {
            winner,
            scores: { player_1: s1, player_2: s2 }
        });

        this.broadcastState();
    }

    // МЯГКИЙ РЕСТАРТ ПОСЛЕ ИГРЫ: Сохраняем игроков, сбрасываем счет и идем в CUSTOMIZATION
    handleRestartGame() {
        if (this.players.player_1) {
            this.players.player_1.score = 0;
            this.players.player_1.ready = false;
            this.players.player_1.character = null;
        }
        if (this.players.player_2) {
            this.players.player_2.score = 0;
            this.players.player_2.ready = false;
            this.players.player_2.character = null;
        }

        this.currentRound = 1;
        this.strikerRole = 'player_1';
        this.keeperRole = 'player_2';
        this.roundChoices = { player_1: null, player_2: null };

        // Сразу на экран создания персонажа!
        this.state = GAME_STATES.CUSTOMIZATION;

        this.broadcastState();
    }

    // ПОЛНЫЙ СБРОС (по кнопке Reset или таймауту)
    handleForceReset() {
        this.hardResetRoom();
        this.io.emit('room:hard_reset');
        this.broadcastState();
    }

    handleDisconnect(socket) {
        const role = socket.role;
        if (!role || !this.players[role]) return;

        this.players[role].isConnected = false;

        this.io.emit('room:player_disconnected', {
            role,
            timeoutSec: RECONNECT_TIMEOUT_MS / 1000
        });

        this.disconnectTimer = setTimeout(() => {
            this.handleForceReset();
        }, RECONNECT_TIMEOUT_MS);
    }

    broadcastState() {
        this.io.emit('state:sync', {
            state: this.state,
            currentRound: this.currentRound,
            totalRounds: TOTAL_ROUNDS,
            strikerRole: this.strikerRole,
            keeperRole: this.keeperRole,
            slots: {
                player_1_taken: !!(this.players.player_1 && this.players.player_1.isConnected),
                player_2_taken: !!(this.players.player_2 && this.players.player_2.isConnected)
            },
            choicesStatus: {
                player_1_chosen: this.roundChoices.player_1 !== null,
                player_2_chosen: this.roundChoices.player_2 !== null
            },
            scores: {
                player_1: this.players.player_1?.score || 0,
                player_2: this.players.player_2?.score || 0
            }
        });
    }
}