import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, PlayerRole } from "../../../game/types";
import type { ZoneId } from "./zones";

interface UseRoundSelectionParams {
  sync: GameState["sync"];
  myRole: PlayerRole | null;
  lastChoiceMade: GameState["lastChoiceMade"];
  emit: (event: string, payload?: number) => void;
}

export interface RoundSelection {
  /** Зона, выбранная локальным игроком в ТЕКУЩЕМ раунде */
  myZone: ZoneId | null;
  /** Выбор уже сделан — все пять кнопок блокируются */
  hasChosen: boolean;
  /** Соперник принял решение (сам выбор остаётся скрытым до round:resolved) */
  rivalChosen: boolean;
  selectZone: (zone: ZoneId) => void;
}

const otherRole = (role: PlayerRole): PlayerRole =>
  role === "player_1" ? "player_2" : "player_1";

/**
 * Локальная view-model выбора зоны.
 *
 * Здесь нет игровой логики: хук только помнит, что нажал ЭТОТ терминал,
 * и гарантирует ровно один game:choose_zone за раунд.
 *
 * Всё состояние привязано к sync.currentRound, поэтому переход к следующему
 * раунду автоматически сбрасывает выбор — без отдельного эффекта и без
 * мигания интерфейса на кадре сброса.
 */
export function useRoundSelection({
  sync,
  myRole,
  lastChoiceMade,
  emit,
}: UseRoundSelectionParams): RoundSelection {
  const round = sync?.currentRound ?? 0;

  const [selection, setSelection] = useState<{ round: number; zone: ZoneId | null }>({
    round: 0,
    zone: null,
  });
  const [rivalMark, setRivalMark] = useState<{ round: number; chosen: boolean }>({
    round: 0,
    chosen: false,
  });
  // Синхронный замок: защищает от double-tap внутри одного тика,
  // до того как отработает setState.
  const lockRef = useRef<{ round: number; locked: boolean }>({ round: 0, locked: false });

  const rivalRole = myRole ? otherRole(myRole) : null;

  // На бэкенде state:sync не рассылается в момент выбора, поэтому choicesStatus
  // это лишь подстраховка (реконнект, MockConnection), а не основной сигнал.
  const syncSaysIChose = !!(myRole && sync?.choicesStatus[`${myRole}_chosen`]);
  const syncSaysRivalChose = !!(rivalRole && sync?.choicesStatus[`${rivalRole}_chosen`]);

  useEffect(() => {
    if (!sync || !myRole || !lastChoiceMade) return;
    if (lastChoiceMade.role === myRole) return;
    // Событие из предыдущего раунда: роли уже поменялись местами.
    // gameReducer не очищает lastChoiceMade, поэтому отсекаем протухшее здесь.
    if (lastChoiceMade.strikerRole !== sync.strikerRole) return;

    const eventRound = sync.currentRound;
    setRivalMark((prev) =>
      prev.round === eventRound && prev.chosen ? prev : { round: eventRound, chosen: true },
    );
  }, [lastChoiceMade, myRole, sync]);

  const myZone = selection.round === round ? selection.zone : null;
  const hasChosen = myZone !== null || syncSaysIChose;
  const rivalChosen = (rivalMark.round === round && rivalMark.chosen) || syncSaysRivalChose;

  const selectZone = useCallback(
    (zone: ZoneId) => {
      if (!sync || sync.state !== "PLAYING") return;
      if (lockRef.current.locked && lockRef.current.round === round) return;
      if (syncSaysIChose) return;

      lockRef.current = { round, locked: true };
      setSelection({ round, zone });
      emit("game:choose_zone", zone);
    },
    [emit, round, sync, syncSaysIChose],
  );

  return { myZone, hasChosen, rivalChosen, selectZone };
}
