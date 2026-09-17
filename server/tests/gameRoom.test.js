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

    beforeEach(() => {
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

        // Teraz strzelec (player_1) wybiera cel
        room.handleMakeChoice(socket1, 1);
        assert.strictEqual(room.state, GAME_STATES.ROUND_RESULT); // Wybrali obaj -> rozstrzygnięcie
    });
});