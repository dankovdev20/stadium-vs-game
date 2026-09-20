// tests/gameRoom.test.js
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GameRoom, GAME_STATES } from '../src/gameRoom.js';

// Mock Socket.io
class MockSocket {
    constructor(id) {
        this.id = id;
        this.role = null;
        this.emitted = [];
    }
    emit(event, data) {
        this.emitted.push({ event, data });
    }
}

class MockIO {
    constructor() {
        this.broadcasts = [];
    }
    emit(event, data) {
        this.broadcasts.push({ event, data });
    }
}

describe('2. Maszyna Stanów (gameRoom.js)', () => {
    let room;
    let io;
    let socket1;
    let socket2;

    // handleSelectRole/handleCharacterReady uzbrajają idle-timer (90s) —
    // mockujemy timery, żeby nie trzymać realnego zegara podczas testów.
    beforeEach((t) => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        io = new MockIO();
        room = new GameRoom(io);
        socket1 = new MockSocket('sock_1');
        socket2 = new MockSocket('sock_2');
    });

    it('Gracz może wybrać rolę w LOBBY, a zajęta rola jest blokowana', () => {
        room.handleSelectRole(socket1, 'player_1');
        assert.strictEqual(socket1.role, 'player_1');
        assert.strictEqual(room.players.player_1.socketId, 'sock_1');

        // Próba zajęcia tej samej roli przez drugiego gracza powinna zostać odrzucona
        room.handleSelectRole(socket2, 'player_1');
        assert.strictEqual(socket2.role, null);

        // Drugi gracz wybiera player_2
        room.handleSelectRole(socket2, 'player_2');
        assert.strictEqual(socket2.role, 'player_2');

        // Po zajęciu obu ról pokój przechodzi w tryb CUSTOMIZATION
        assert.strictEqual(room.state, GAME_STATES.CUSTOMIZATION);
    });

    it('Bariera synchronizacji: runda nie kończy się dopóki obaj nie wybiorą', () => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleSelectRole(socket2, 'player_2');

        // Zatwierdzenie postaci przez obu
        room.handleCharacterReady(socket1, { headId: 1, bodyId: 1, legsId: 1 });
        assert.strictEqual(room.state, GAME_STATES.CUSTOMIZATION); // Czekamy na drugiego

        room.handleCharacterReady(socket2, { headId: 2, bodyId: 2, legsId: 2 });
        assert.strictEqual(room.state, GAME_STATES.PLAYING); // Obaj gotowi -> gramy

        // Tylko bramkarz (player_2) wybiera cel
        room.handleMakeChoice(socket2, 3);
        assert.strictEqual(room.roundChoices.player_2, 3);
        assert.strictEqual(room.roundChoices.player_1, null);
        assert.strictEqual(room.state, GAME_STATES.PLAYING); // Gra nadal czeka na strzelca!

        // KLUCZOWE: klient rozpoznaje "mój wybór zapisany" WYŁĄCZNIE po
        // choicesStatus w state:sync — musi się zaktualizować od razu po
        // JEDNYM wyborze, a nie dopiero gdy obaj skończą (inaczej przycisk
        // nie blokuje się i cichy powtórny tap ginie bez żadnej reakcji).
        const lastSync = room.io.broadcasts.filter((b) => b.event === 'state:sync').at(-1).data;
        assert.strictEqual(lastSync.choicesStatus.player_2_chosen, true);
        assert.strictEqual(lastSync.choicesStatus.player_1_chosen, false);

        // Teraz strzelec (player_1) wybiera cel
        room.handleMakeChoice(socket1, 1);
        assert.strictEqual(room.state, GAME_STATES.ROUND_RESULT); // Wybrali obaj -> rozstrzygnięcie
    });
});

describe('3. Głosowanie "Zagraj ponownie" i auto-reset przy bezczynności (gameRoom.js)', () => {
    let room;
    let io;
    let socket1;
    let socket2;

    // Mock-timery включаем ДО любых вызовов, которые могут завести setTimeout
    // (armIdleTimer срабатывает уже на handleSelectRole) — иначе таймер на
    // 90 сек уходит в реальность и держит процесс живым до своего срабатывания.
    beforeEach((t) => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        io = new MockIO();
        room = new GameRoom(io);
        socket1 = new MockSocket('sock_1');
        socket2 = new MockSocket('sock_2');
        room.handleSelectRole(socket1, 'player_1');
        room.handleSelectRole(socket2, 'player_2');
    });

    it('Obaj gracze potwierdzają przed upływem czasu -> natychmiastowy restart do CUSTOMIZATION', () => {
        room.finishGame();
        assert.strictEqual(room.state, GAME_STATES.GAME_OVER);

        room.handleRestartGame(socket1);
        assert.strictEqual(room.restartVotes.player_1, true);
        assert.strictEqual(room.state, GAME_STATES.GAME_OVER); // wciąż czekamy na drugiego

        room.handleRestartGame(socket2);
        assert.strictEqual(room.state, GAME_STATES.CUSTOMIZATION); // obaj potwierdzili -> restart od razu
        assert.strictEqual(room.restartTimer, null);
    });

    it('Potwierdza tylko jeden gracz -> po timeout pełny reset do LOBBY', (t) => {
        room.finishGame();

        room.handleRestartGame(socket1);
        assert.strictEqual(room.state, GAME_STATES.GAME_OVER);

        t.mock.timers.tick(10000);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
        assert.strictEqual(room.players.player_1, null);
    });

    it('LOBBY z jednym zajętym miejscem bez żadnej akcji -> auto-reset po czasie bezczynności', (t) => {
        const idleRoom = new GameRoom(io);
        const idleSocket = new MockSocket('sock_idle');
        idleRoom.handleSelectRole(idleSocket, 'player_1');
        assert.strictEqual(idleRoom.state, GAME_STATES.LOBBY);

        t.mock.timers.tick(90000);
        assert.strictEqual(idleRoom.players.player_1, null); // pokój zresetowany
    });

    it('Auto-reset przy bezczynności NIE działa w trakcie PLAYING', (t) => {
        room.handleCharacterReady(socket1, { headId: 1, bodyId: 1, legsId: 1 });
        room.handleCharacterReady(socket2, { headId: 1, bodyId: 1, legsId: 1 });
        assert.strictEqual(room.state, GAME_STATES.PLAYING);

        t.mock.timers.tick(90000);
        assert.strictEqual(room.state, GAME_STATES.PLAYING); // mecz nie przerwany mimo symulowanego czasu
    });
});

describe('4. Reconnect i odzyskiwanie sesji (gameRoom.js)', () => {
    let room;
    let io;
    let socket1;
    let socket2;

    beforeEach((t) => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        io = new MockIO();
        room = new GameRoom(io);
        socket1 = new MockSocket('sock_1');
        socket2 = new MockSocket('sock_2');
        room.handleSelectRole(socket1, 'player_1');
        room.handleSelectRole(socket2, 'player_2');
    });

    it('Gracz może odzyskać rolę po zerwaniu połączenia używając sessionToken', (t) => {
        const token1 = room.players.player_1.sessionToken;
        assert.ok(token1, 'sessionToken musi być wygenerowany');

        // Przejście do PLAYING
        room.handleCharacterReady(socket1, { headId: 1, bodyId: 1, legsId: 1 });
        room.handleCharacterReady(socket2, { headId: 2, bodyId: 2, legsId: 2 });
        assert.strictEqual(room.state, GAME_STATES.PLAYING);

        // Rozłączenie socket1
        room.handleDisconnect(socket1);
        assert.strictEqual(room.players.player_1.isConnected, false);
        assert.notStrictEqual(room.disconnectTimer, null);

        // Nowe połączenie z tym samym tokenem
        const newSocket = new MockSocket('sock_reconnected');
        room.handleReconnect(newSocket, { sessionToken: token1 });

        assert.strictEqual(newSocket.role, 'player_1');
        assert.strictEqual(room.players.player_1.isConnected, true);
        assert.strictEqual(room.players.player_1.socketId, 'sock_reconnected');
        assert.strictEqual(room.disconnectTimer, null);

        // Po 10 sekundach mecz nadal trwa i nie został zresetowany
        t.mock.timers.tick(10000);
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
        assert.strictEqual(room.players.player_1.isConnected, true);
    });

    it('Próba reconnectu z niepoprawnym tokenem jest odrzucana', () => {
        const fakeSocket = new MockSocket('sock_fake');
        room.handleReconnect(fakeSocket, { sessionToken: 'invalid_token_123' });

        assert.strictEqual(fakeSocket.role, null);
        const err = fakeSocket.emitted.find((e) => e.event === 'room:error');
        assert.ok(err);
        assert.strictEqual(err.data.code, 'RECONNECT_FAILED');
    });

    it('Po upływie czasu oczekiwania (10s) pokój resetuje się i token wygasa', (t) => {
        const token1 = room.players.player_1.sessionToken;
        room.handleDisconnect(socket1);

        t.mock.timers.tick(10000);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
        assert.strictEqual(room.players.player_1, null);

        // Próba spóźnionego powrotu
        const lateSocket = new MockSocket('sock_late');
        room.handleReconnect(lateSocket, { sessionToken: token1 });
        assert.strictEqual(lateSocket.role, null);
        const err = lateSocket.emitted.find((e) => e.event === 'room:error');
        assert.strictEqual(err.data.code, 'RECONNECT_FAILED');
    });
});