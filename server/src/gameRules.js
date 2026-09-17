/**
 * Strefy / Cele:
 * 1: Góra-Lewo (2 pkt)
 * 2: Góra-Środek (2 pkt)
 * 3: Góra-Prawo (2 pkt)
 * 4: Dół-Lewo (1 pkt)
 * 5: Dół-Prawo (1 pkt)
 */

export const ZONES = {
    1: { id: 1, name: 'Góra-Lewo', isTop: true, points: 2 },
    2: { id: 2, name: 'Góra-Środek', isTop: true, points: 2 },
    3: { id: 3, name: 'Góra-Prawo', isTop: true, points: 2 },
    4: { id: 4, name: 'Dół-Lewo', isTop: false, points: 1 },
    5: { id: 5, name: 'Dół-Prawo', isTop: false, points: 1 },
};

/**
 * Расчет исхода удара строго по таблице PDF
 * @param {number} strikerZone (1-5)
 * @param {number} keeperZone (1-5)
 */
export function resolveShot(strikerZone, keeperZone) {
    const target = ZONES[strikerZone];
    if (!target) {
        throw new Error(`Nieprawidłowa strefa strzału: ${strikerZone}`);
    }

    // Krok 2: Rozstrzygnięcie Pozycji
    // Strefy ZGADZAJĄ SIĘ: Bramkarz robi idealną paradę. GOL = 0%
    if (strikerZone === keeperZone) {
        return {
            isGoal: false,
            pointsAwarded: 0,
            outcome: 'OBRONA_PERFEKCYJNA',
            details: 'Bramkarz wyczuł intencję i obronił strzał!'
        };
    }

    // Krok 3: Wpływ Losowego (Strefy RÓŻNIĄ SIĘ)
    const rng = Math.random() * 100; // 0.00 do 99.99

    if (target.isTop) {
        // GÓRA (Cele 1, 2, 3):
        // 20% Pudło (Słupek/Poprzeczka dla 1, 3; Nad poprzeczką dla 2)
        // 10% Fuks bramkarza
        // 70% Gol (2 pkt)
        if (rng < 20) {
            const missType = target.id === 2 ? 'NAD_POPRZECZKA' : 'SLUPEK_POPRZECZKA';
            return {
                isGoal: false,
                pointsAwarded: 0,
                outcome: missType,
                details: target.id === 2 ? 'Piłka przeleciała nad poprzeczką!' : 'Strzał w słupek lub poprzeczkę!'
            };
        } else if (rng < 30) {
            return {
                isGoal: false,
                pointsAwarded: 0,
                outcome: 'FUKS_BRAMKARZA',
                details: 'Niewiarygodna losowa obrona bramkarza (Fuks)!'
            };
        } else {
            return {
                isGoal: true,
                pointsAwarded: target.points,
                outcome: 'GOL',
                details: 'GOL! Piękny strzał w górną strefę (+2 pkt)!'
            };
        }
    } else {
        // DÓŁ (Cele 4, 5):
        // 0% Pudła (strzał zawsze w światło)
        // 30% Obrona nogą
        // 70% Gol (1 pkt)
        if (rng < 30) {
            return {
                isGoal: false,
                pointsAwarded: 0,
                outcome: 'OBRONA_NOGA',
                details: 'Bramkarz zdołał sparować piłkę nogą!'
            };
        } else {
            return {
                isGoal: true,
                pointsAwarded: target.points,
                outcome: 'GOL',
                details: 'GOL! Pewny strzał po ziemi (+1 pkt)!'
            };
        }
    }
}