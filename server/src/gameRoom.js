// src/gameRoom.js
import crypto from 'crypto';
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

// Сколько ждём подтверждения "Играть снова" от ОБОИХ игроков, прежде чем
// сдаться и увести комнату обратно в LOBBY. Живая правка контракта —
// см. shared/put_me_in_context.md, РАЗДЕЛ 7.
const RESTART_VOTE_TIMEOUT_MS = 10000;

// Выставочный формат: если комната застряла в LOBBY/CUSTOMIZATION (кто-то
// зашёл и бросил), освобождаем стенд для следующих игроков.
const IDLE_TIMEOUT_MS = 90000;

// Пауза между результатом раунда и следующим раундом (анимация на клиенте).
const ROUND_RESULT_DELAY_MS = 4000;

// Простой в матче: если в текущем раунде никто ничего не выбирает так долго —
// дети ушли от стенда, освобождаем его. 60с на один тап — это много.
const PLAY_IDLE_TIMEOUT_MS = 60000;

const ROLES = ['player_1', 'player_2'];

export class GameRoom {
    constructor(io) {
        this.io = io;
        this.hardResetRoom();
    }

    // Роль сокета, только если он всё ещё актуальный сокет этого игрока.
    // socket.role может «протухнуть»: после сброса комнаты или после того,
    // как игрок переподключился новым сокетом, — такой сокет больше ничего
    // не решает за игрока.
    roleOf(socket) {
        const role = socket.role;
        if (!ROLES.includes(role)) return null;
        return this.players[role]?.socketId === socket.id ? role : null;
    }

    // Живой сокет по id (у фейкового io в тестах его нет — отсюда ?.).
    findSocket(socketId) {
        return this.io.sockets?.sockets?.get?.(socketId);
    }

    // Полный сброс в самое начало (Лобби)
    hardResetRoom() {
        for (const s of this.io.sockets?.sockets?.values?.() ?? []) s.role = undefined;
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
            this.roundTimer = null;
        }
        if (this.playIdleTimer) {
            clearTimeout(this.playIdleTimer);
            this.playIdleTimer = null;
        }
        if (this.disconnectTimer) {
            clearTimeout(this.disconnectTimer);
            this.disconnectTimer = null;
        }
        if (this.restartTimer) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
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
        this.restartVotes = { player_1: false, player_2: false };
        this.restartDeadline = null;
    }

    // Вооружает/перевооружает таймер простоя. Актуален только пока комната
    // "в подвешенном" состоянии до начала матча (LOBBY с занятым слотом или
    // CUSTOMIZATION) — во время самого матча простой не сбрасываем, чтобы не
    // обрывать игру из-за паузы на подумать.
    armIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        const shouldArm =
            this.state === GAME_STATES.CUSTOMIZATION ||
            (this.state === GAME_STATES.LOBBY &&
                (this.players.player_1?.isConnected || this.players.player_2?.isConnected));

        if (shouldArm) {
            this.idleTimer = setTimeout(() => this.handleForceReset(), IDLE_TIMEOUT_MS);
        }
    }

    // Таймер простоя матча: взводится на каждый новый раунд и на каждый выбор
    // зоны, гасится в hardResetRoom()/finishGame().
    armPlayIdleTimer() {
        this.clearPlayIdleTimer();
        this.playIdleTimer = setTimeout(() => this.handleForceReset(), PLAY_IDLE_TIMEOUT_MS);
    }

    clearPlayIdleTimer() {
        if (this.playIdleTimer) {
            clearTimeout(this.playIdleTimer);
            this.playIdleTimer = null;
        }
    }

    // 1. Выбор роли в лобби
    handleSelectRole(socket, requestedRole) {
        if (this.state !== GAME_STATES.LOBBY) return;
        if (!ROLES.includes(requestedRole)) return;

        const currentRole = this.roleOf(socket);

        // Защита от захвата обеих ролей одним сокетом:
        // Если у сокета уже есть роль и она отличается от запрошенной — отклоняем
        if (currentRole && currentRole !== requestedRole) {
            socket.emit('room:error', { code: 'ROLE_TAKEN', message: 'Masz już przypisaną rolę!' });
            return;
        }

        // Если этот же сокет повторно жмет свою же роль — игнорируем повторный вызов
        if (currentRole === requestedRole) {
            return;
        }

        if (this.players[requestedRole] && (this.players[requestedRole].isConnected || this.players[requestedRole].sessionToken)) {
            socket.emit('room:error', { code: 'ROLE_TAKEN', message: 'Ta rola jest już zajęta!' });
            return;
        }

        const sessionToken = crypto.randomUUID();
        socket.role = requestedRole;
        this.players[requestedRole] = {
            socketId: socket.id,
            ready: false,
            character: null,
            score: 0,
            isConnected: true,
            sessionToken
        };

        socket.emit('role:assigned', { role: requestedRole, sessionToken });

        // Если оба выбрали роли — сразу переходим к созданию персонажа
        if (this.players.player_1?.isConnected && this.players.player_2?.isConnected) {
            this.state = GAME_STATES.CUSTOMIZATION;
        }

        this.armIdleTimer();
        this.broadcastState();
    }

    // 2. Подтверждение персонажа
    handleCharacterReady(socket, characterData) {
        if (this.state !== GAME_STATES.CUSTOMIZATION) return;
        const role = this.roleOf(socket);
        if (!role) return;
        const player = this.players[role];

        const character = sanitizeCharacter(characterData);
        if (!character) return;

        player.character = character;
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
            this.armPlayIdleTimer();
        }

        this.armIdleTimer();
        this.broadcastState();
    }

    // 3. Выбор зоны (1-5)
    handleMakeChoice(socket, zoneId) {
        if (this.state !== GAME_STATES.PLAYING) return;
        const role = this.roleOf(socket);
        if (!role) return;
        // NaN/дробные/мусор — игнор (иначе resolveShot бросит и уронит процесс)
        if (!Number.isInteger(zoneId) || zoneId < 1 || zoneId > 5) return;

        if (this.roundChoices[role] !== null) return; // Защита от спама

        this.roundChoices[role] = zoneId;
        this.armPlayIdleTimer();

        this.io.emit('round:choice_made', {
            role,
            strikerRole: this.strikerRole,
            keeperRole: this.keeperRole
        });
        // ВАЖНО: без этого choicesStatus в state:sync не обновлялся, пока не
        // выбрали ОБА — клиент не мог понять "мой выбор принят", кнопка
        // оставалась активной, а повторный тап тем же игроком молча
        // отклонялся защитой от спама выше без всякой обратной связи.
        this.broadcastState();

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

        // Таймер храним, чтобы hardResetRoom() мог его погасить: иначе сброс
        // в окне результата «оживлял» пустую комнату в PLAYING.
        this.roundTimer = setTimeout(() => {
            this.roundTimer = null;
            this.nextRound();
        }, ROUND_RESULT_DELAY_MS);
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
        this.armPlayIdleTimer();

        this.broadcastState();
    }

    finishGame() {
        this.clearPlayIdleTimer();
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

        // Окно голосования "Играть снова": если за RESTART_VOTE_TIMEOUT_MS
        // не подтвердят ОБА — считаем, что стенд свободен, и сбрасываем в LOBBY.
        this.restartVotes = { player_1: false, player_2: false };
        this.restartDeadline = Date.now() + RESTART_VOTE_TIMEOUT_MS;
        this.restartTimer = setTimeout(() => this.handleForceReset(), RESTART_VOTE_TIMEOUT_MS);

        this.broadcastState();
    }

    // ГОЛОС ЗА РЕСТАРТ (кнопка "Zagraj Ponownie" на GAME_OVER).
    // Рестарт происходит только когда проголосовали ОБА — иначе ждём до
    // дедлайна, после которого finishGame()'овский таймер уведёт в LOBBY.
    handleRestartGame(socket) {
        if (this.state !== GAME_STATES.GAME_OVER) return;
        const role = this.roleOf(socket);
        if (!role || this.restartVotes[role]) return;

        this.restartVotes[role] = true;
        this.broadcastState();

        if (this.restartVotes.player_1 && this.restartVotes.player_2) {
            if (this.restartTimer) {
                clearTimeout(this.restartTimer);
                this.restartTimer = null;
            }
            this._doRestart();
        }
    }

    // МЯГКИЙ РЕСТАРТ ПОСЛЕ ИГРЫ: Сохраняем игроков, сбрасываем счет и идем в CUSTOMIZATION
    _doRestart() {
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
            this.roundTimer = null;
        }
        this.clearPlayIdleTimer();
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
        this.restartVotes = { player_1: false, player_2: false };
        this.restartDeadline = null;

        // Сразу на экран создания персонажа!
        this.state = GAME_STATES.CUSTOMIZATION;

        this.armIdleTimer();
        this.broadcastState();
    }

    // ПОЛНЫЙ СБРОС (по кнопке Reset или таймауту)
    handleForceReset() {
        this.hardResetRoom();
        this.io.emit('room:hard_reset');
        this.broadcastState();
    }

    handleDisconnect(socket) {
        // roleOf() отсекает старый сокет игрока, который уже вернулся новым —
        // его смерть не должна сбрасывать живой матч.
        const role = this.roleOf(socket);
        if (!role) return;

        // В LOBBY матча ещё нет — держать слот 10с незачем: UI показал бы его
        // свободным, а сервер отвечал бы ROLE_TAKEN. Освобождаем сразу.
        if (this.state === GAME_STATES.LOBBY) {
            this.players[role] = null;
            this.armIdleTimer();
            this.broadcastState();
            return;
        }

        this.players[role].isConnected = false;

        this.io.emit('room:player_disconnected', {
            role,
            timeoutSec: RECONNECT_TIMEOUT_MS / 1000
        });

        if (!this.disconnectTimer) {
            this.disconnectTimer = setTimeout(() => {
                this.handleForceReset();
            }, RECONNECT_TIMEOUT_MS);
        }

        this.broadcastState();
    }

    // Восстановление сессии при повторном подключении сокета
    handleReconnect(socket, payload) {
        if (!payload) {
            socket.emit('room:error', { code: 'RECONNECT_FAILED', message: 'Brak danych sesji.' });
            return;
        }

        const token = typeof payload === 'string' ? payload : (payload.sessionToken || payload.token);
        let role = typeof payload === 'object' && ROLES.includes(payload.role) ? payload.role : null;

        if (!role && token) {
            if (this.players.player_1?.sessionToken === token) role = 'player_1';
            else if (this.players.player_2?.sessionToken === token) role = 'player_2';
        }

        if (!role || !this.players[role] || !this.players[role].sessionToken || this.players[role].sessionToken !== token) {
            socket.emit('room:error', { code: 'RECONNECT_FAILED', message: 'Nieprawidłowy token sesji lub pokój został zresetowany.' });
            return;
        }

        // Старый сокет (если ещё жив) больше не говорит от имени игрока.
        const oldSocketId = this.players[role].socketId;
        const oldSocket = oldSocketId !== socket.id ? this.findSocket(oldSocketId) : null;
        if (oldSocket) oldSocket.role = undefined;

        socket.role = role;
        this.players[role].socketId = socket.id;
        this.players[role].isConnected = true;

        // Если оба игрока теперь подключены, отменяем таймер сброса по дисконнекту
        const otherRole = role === 'player_1' ? 'player_2' : 'player_1';
        const otherPlayer = this.players[otherRole];
        if (!otherPlayer || otherPlayer.isConnected) {
            if (this.disconnectTimer) {
                clearTimeout(this.disconnectTimer);
                this.disconnectTimer = null;
            }
        }

        socket.emit('role:assigned', {
            role,
            sessionToken: token,
            reconnected: true
        });

        this.io.emit('room:player_reconnected', { role });
        this.broadcastState();
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
            },
            characters: {
                player_1: this.players.player_1?.character ?? null,
                player_2: this.players.player_2?.character ?? null
            },
            restart: {
                player_1_ready: this.restartVotes.player_1,
                player_2_ready: this.restartVotes.player_2,
                deadline: this.restartDeadline
            }
        });
    }
}
// character:submit приходит от клиента как есть — берём только три целых id,
// всё остальное (лишние поля, строки, мусор) не сохраняем и не рассылаем.
function sanitizeCharacter(data) {
    if (!data || typeof data !== 'object') return null;
    const { headId, bodyId, legsId } = data;
    if (![headId, bodyId, legsId].every((id) => Number.isInteger(id) && id >= 0)) return null;
    return { headId, bodyId, legsId };
}
