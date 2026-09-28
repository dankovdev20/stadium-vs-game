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

    it('Jeden socket nie może zająć obu ról ani zmienić roli po jej wybraniu', () => {
        room.handleSelectRole(socket1, 'player_1');
        assert.strictEqual(socket1.role, 'player_1');

        // Ten sam socket próbuje zająć drugą rolę (player_2)
        room.handleSelectRole(socket1, 'player_2');
        assert.strictEqual(socket1.role, 'player_1');
        assert.strictEqual(room.players.player_2, null);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);

        const roleErr = socket1.emitted.find((e) => e.event === 'room:error');
        assert.ok(roleErr);
        assert.strictEqual(roleErr.data.code, 'ROLE_TAKEN');

        // Powtórny klik w tę samą rolę przez ten sam socket nie powinien nic zepsuć ani zmienić tokenu
        const currentToken = room.players.player_1.sessionToken;
        room.handleSelectRole(socket1, 'player_1');
        assert.strictEqual(room.players.player_1.sessionToken, currentToken);
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

    it('Auto-reset z LOBBY/CUSTOMIZATION (90s) NIE przerywa meczu w trakcie PLAYING', (t) => {
        room.handleCharacterReady(socket1, { headId: 1, bodyId: 1, legsId: 1 });
        t.mock.timers.tick(89000); // prawie cały idle-timer customizacji minął
        room.handleCharacterReady(socket2, { headId: 1, bodyId: 1, legsId: 1 });
        assert.strictEqual(room.state, GAME_STATES.PLAYING);

        // gracze myślą, ale co jakiś czas wybierają -> mecz trwa
        t.mock.timers.tick(50000);
        room.handleMakeChoice(socket2, 3);
        t.mock.timers.tick(50000);
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

// Scenariusze "jak na stoisku" z server/TASKS_FOR_BACKEND.md (2026-09-25).
describe('5. Odporność pętli stoiska (gameRoom.js)', () => {
    let room;
    let io;
    let socket1;
    let socket2;

    const toPlaying = () => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleSelectRole(socket2, 'player_2');
        room.handleCharacterReady(socket1, { headId: 1, bodyId: 1, legsId: 1 });
        room.handleCharacterReady(socket2, { headId: 2, bodyId: 2, legsId: 2 });
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
    };

    beforeEach((t) => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        io = new MockIO();
        room = new GameRoom(io);
        socket1 = new MockSocket('sock_1');
        socket2 = new MockSocket('sock_2');
    });

    it('1: po resecie ten sam socket może wziąć inną rolę', () => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleForceReset();

        room.handleSelectRole(socket1, 'player_2');
        assert.strictEqual(socket1.role, 'player_2');
        assert.strictEqual(room.players.player_2.socketId, 'sock_1');
        const assigned = socket1.emitted.filter((e) => e.event === 'role:assigned').at(-1);
        assert.strictEqual(assigned.data.role, 'player_2');
    });

    it('1: hardResetRoom czyści socket.role u żywych socketów prawdziwego io', () => {
        const live = new Map([['sock_1', socket1], ['sock_2', socket2]]);
        io.sockets = { sockets: live };
        room.handleSelectRole(socket1, 'player_1');
        room.handleForceReset();
        assert.strictEqual(socket1.role, undefined);
    });

    it('1: socket z "przeterminowaną" rolą nie gra za nowego gracza', () => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleForceReset(); // socket1.role nadal 'player_1' (fałszywe io bez listy socketów)

        const fresh = new MockSocket('sock_fresh');
        room.handleSelectRole(fresh, 'player_1');
        room.handleSelectRole(socket2, 'player_2');
        room.handleCharacterReady(socket1, { headId: 9, bodyId: 9, legsId: 9 });
        assert.strictEqual(room.players.player_1.character, null);
        assert.strictEqual(room.players.player_1.ready, false);
    });

    it('2: reset w trakcie ROUND_RESULT nie ożywia pokoju po 4s', (t) => {
        toPlaying();
        room.handleMakeChoice(socket1, 1);
        room.handleMakeChoice(socket2, 3);
        assert.strictEqual(room.state, GAME_STATES.ROUND_RESULT);

        room.handleForceReset();
        t.mock.timers.tick(4000);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
        assert.strictEqual(room.currentRound, 1);
    });

    it('2: normalnie po ROUND_RESULT przychodzi następna runda ze zmianą ról', (t) => {
        toPlaying();
        room.handleMakeChoice(socket1, 1);
        room.handleMakeChoice(socket2, 3);
        t.mock.timers.tick(4000);
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
        assert.strictEqual(room.currentRound, 2);
        assert.strictEqual(room.strikerRole, 'player_2');
    });

    it('3: disconnect starego socketu po reconnect nie rusza gracza', (t) => {
        toPlaying();
        const sessionToken = room.players.player_1.sessionToken;
        const a2 = new MockSocket('sock_1_new');
        room.handleReconnect(a2, { sessionToken });

        room.handleDisconnect(socket1);
        assert.strictEqual(room.players.player_1.isConnected, true);
        assert.strictEqual(room.disconnectTimer ?? null, null);
        t.mock.timers.tick(10000);
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
    });

    it('3: stary socket po reconnect nie może wybierać za gracza', () => {
        toPlaying();
        const a2 = new MockSocket('sock_1_new');
        room.handleReconnect(a2, { sessionToken: room.players.player_1.sessionToken });

        room.handleMakeChoice(socket1, 2);
        assert.strictEqual(room.roundChoices.player_1, null);
        room.handleMakeChoice(a2, 2);
        assert.strictEqual(room.roundChoices.player_1, 2);
    });

    it('4: śmieciowa strefa jest ignorowana i nic nie rzuca', () => {
        toPlaying();
        for (const bad of [NaN, 2.5, 0, 6, -1, undefined, null, '3', Infinity]) {
            assert.doesNotThrow(() => room.handleMakeChoice(socket1, bad));
        }
        assert.strictEqual(room.roundChoices.player_1, null);
        room.handleMakeChoice(socket2, 3);
        assert.strictEqual(room.state, GAME_STATES.PLAYING); // nie rozstrzygnięto z NaN
    });

    it('4: character:submit z niepoprawnymi danymi jest ignorowany', () => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleSelectRole(socket2, 'player_2');
        for (const bad of [null, 'abc', 42, {}, { headId: 'x', bodyId: 1, legsId: 1 }, { headId: 1.5, bodyId: 1, legsId: 1 }]) {
            room.handleCharacterReady(socket1, bad);
        }
        assert.strictEqual(room.players.player_1.ready, false);
        assert.strictEqual(room.players.player_1.character, null);

        room.handleCharacterReady(socket1, { headId: 1, bodyId: 2, legsId: 3, extra: 'x'.repeat(1000) });
        assert.deepStrictEqual(room.players.player_1.character, { headId: 1, bodyId: 2, legsId: 3 });
    });

    it('5: bezczynność w PLAYING -> po 60s reset do LOBBY', (t) => {
        toPlaying();
        t.mock.timers.tick(59999);
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
        t.mock.timers.tick(1);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
        assert.ok(io.broadcasts.some((b) => b.event === 'room:hard_reset'));
    });

    it('5: timer bezczynności meczu liczy się od ostatniego wyboru i od nowej rundy', (t) => {
        toPlaying();
        t.mock.timers.tick(50000);
        room.handleMakeChoice(socket1, 1);
        t.mock.timers.tick(50000);
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
        room.handleMakeChoice(socket2, 3); // -> ROUND_RESULT, po 4s runda 2
        // osobno: timery zaplanowane w callbacku liczą się od końca tick()
        t.mock.timers.tick(4000);
        t.mock.timers.tick(59000);
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
        assert.strictEqual(room.currentRound, 2);
        t.mock.timers.tick(1000);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
    });

    it('5: pełny mecz 10 rund -> GAME_OVER bez resetu przez timer meczu', (t) => {
        toPlaying();
        for (let r = 1; r <= 10; r++) {
            room.handleMakeChoice(socket1, 1);
            room.handleMakeChoice(socket2, 1);
            t.mock.timers.tick(4000);
        }
        assert.strictEqual(room.state, GAME_STATES.GAME_OVER);
        assert.strictEqual(room.playIdleTimer, null);
        // nikt nie głosuje -> po 10s LOBBY, gotowe dla kolejnych dzieci
        t.mock.timers.tick(10000);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
    });

    it('6: disconnect w LOBBY od razu zwalnia miejsce', () => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleDisconnect(socket1);
        assert.strictEqual(room.players.player_1, null);
        assert.strictEqual(room.disconnectTimer ?? null, null);

        room.handleSelectRole(socket2, 'player_1');
        assert.strictEqual(socket2.role, 'player_1');
    });

    it('6: disconnect w CUSTOMIZATION nadal daje 10s na powrót', (t) => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleSelectRole(socket2, 'player_2');
        room.handleDisconnect(socket1);
        assert.strictEqual(room.players.player_1.isConnected, false);
        t.mock.timers.tick(10000);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
    });

    it('CUSTOMIZATION bez zatwierdzenia postaci -> reset po 90s', (t) => {
        room.handleSelectRole(socket1, 'player_1');
        room.handleSelectRole(socket2, 'player_2');
        t.mock.timers.tick(89000);
        assert.strictEqual(room.state, GAME_STATES.CUSTOMIZATION);
        t.mock.timers.tick(1000);
        assert.strictEqual(room.state, GAME_STATES.LOBBY);
    });

    it('Pełna pętla stoiska: mecz -> obaj "zagraj ponownie" -> drugi mecz -> reset -> nowi gracze', (t) => {
        toPlaying();
        for (let r = 1; r <= 10; r++) {
            room.handleMakeChoice(socket1, 2);
            room.handleMakeChoice(socket2, 4);
            t.mock.timers.tick(4000);
        }
        room.handleRestartGame(socket1);
        room.handleRestartGame(socket2);
        assert.strictEqual(room.state, GAME_STATES.CUSTOMIZATION);
        assert.strictEqual(room.players.player_1.score, 0);

        room.handleCharacterReady(socket1, { headId: 3, bodyId: 3, legsId: 3 });
        room.handleCharacterReady(socket2, { headId: 4, bodyId: 4, legsId: 4 });
        assert.strictEqual(room.state, GAME_STATES.PLAYING);
        assert.strictEqual(room.currentRound, 1);

        room.handleForceReset();
        const c = new MockSocket('sock_c');
        const d = new MockSocket('sock_d');
        room.handleSelectRole(c, 'player_1');
        room.handleSelectRole(d, 'player_2');
        assert.strictEqual(room.state, GAME_STATES.CUSTOMIZATION);
    });
});
