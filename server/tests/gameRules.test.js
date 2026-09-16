// tests/gameRules.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveShot, ZONES } from '../src/gameRules.js';

describe('1. Zasady Gry (gameRules.js) - Zgodność z PDF', () => {

    it('Krok 2: Gdy strefy ZGADZAJĄ SIĘ -> 100% obrona, 0 pkt', () => {
        for (let zone = 1; zone <= 5; zone++) {
            const res = resolveShot(zone, zone);
            assert.strictEqual(res.isGoal, false);
            assert.strictEqual(res.pointsAwarded, 0);
            assert.strictEqual(res.outcome, 'OBRONA_PERFEKCYJNA');
        }
    });

    it('Górne cele (1, 2, 3) dają 2 punkty za gol, a dolne (4, 5) dają 1 punkt', () => {
        assert.strictEqual(ZONES[1].points, 2);
        assert.strictEqual(ZONES[2].points, 2);
        assert.strictEqual(ZONES[3].points, 2);
        assert.strictEqual(ZONES[4].points, 1);
        assert.strictEqual(ZONES[5].points, 1);
    });

    it('Krok 3 (Monte Carlo): Niezależnie od strefy, szansa na gol wynosi dokładnie ~70%', () => {
        const SIMULATIONS = 10000;

        // Sprawdzamy Górę (np. strzał w 1, bramkarz w 2)
        let goalsTop = 0;
        for (let i = 0; i < SIMULATIONS; i++) {
            const res = resolveShot(1, 2);
            if (res.isGoal) goalsTop++;
        }
        const rateTop = (goalsTop / SIMULATIONS) * 100;
        // Powinno być w granicach 70% ± 2%
        assert.ok(rateTop >= 68 && rateTop <= 72, `Góra: oczekiwano ~70%, otrzymano ${rateTop}%`);

        // Sprawdzamy Dół (np. strzał w 4, bramkarz w 5)
        let goalsBottom = 0;
        for (let i = 0; i < SIMULATIONS; i++) {
            const res = resolveShot(4, 5);
            if (res.isGoal) goalsBottom++;
        }
        const rateBottom = (goalsBottom / SIMULATIONS) * 100;
        assert.ok(rateBottom >= 68 && rateBottom <= 72, `Dół: oczekiwano ~70%, otrzymano ${rateBottom}%`);
    });
});