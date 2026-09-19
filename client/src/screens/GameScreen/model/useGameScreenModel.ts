import { useCallback, useRef, useState } from "react";
import { useGameEmit, useGameState } from "../../../game/GameContext";
import type { CharacterSelection, PlayerRole } from "../../../game/types";
import { isZoneId, type ZoneId } from "./zoneLayout";

const DEFAULT_CHARACTER: CharacterSelection = { headId: 1, bodyId: 1, legsId: 1 };

const otherRole = (role: PlayerRole): PlayerRole => (role === "player_1" ? "player_2" : "player_1");

/**
 * Локальная view-model выбора зоны — синхронный клиентский замок вместо
 * ожидания сети.
 *
 * Раньше кнопка блокировалась только через `sync.choicesStatus`, который
 * приходит с сервера С СЕТЕВОЙ ЗАДЕРЖКОЙ — быстрый повторный тап (или тап
 * в момент начала нового раунда) успевал проскочить ДО того, как React
 * получит обновление и поставит disabled. Отсюда и баг "кликается через
 * раз". `lockRef` — обычный ref (не state), читается и выставляется
 * СИНХРОННО в момент клика, до всякого emit и до всякого setState, поэтому
 * второй тап в ту же миллисекунду физически не может пройти.
 *
 * `sync.choicesStatus` остаётся подстраховкой (реконнект/перезагрузка
 * страницы, когда локальный стейт ещё не восстановился), а не основным
 * сигналом.
 */
function useRoundSelectionLock() {
  const emit = useGameEmit();
  const { sync, myRole, lastChoiceMade } = useGameState();
  const round = sync?.currentRound ?? 0;

  const [selection, setSelection] = useState<{ round: number; zone: ZoneId | null }>({ round: 0, zone: null });
  const lockRef = useRef<{ round: number; locked: boolean }>({ round: 0, locked: false });

  const rivalRole = myRole ? otherRole(myRole) : null;
  const syncSaysIChose = !!(myRole && sync?.choicesStatus[`${myRole}_chosen`]);
  const syncSaysRivalChose = !!(rivalRole && sync?.choicesStatus[`${rivalRole}_chosen`]);

  // Чистое производное значение, без state/effect: lastChoiceMade уже сам
  // персистентен в gameReducer до следующего выбора соперника, а
  // strikerRole меняется КАЖДЫЙ раунд (nextRound всегда свапает роли), так
  // что сверки "чужой ли это ход" и "не протухло ли событие с прошлого
  // раунда" достаточно — отдельная память в state не нужна.
  const rivalChosenFromEvent = !!(
    sync &&
    myRole &&
    lastChoiceMade &&
    lastChoiceMade.role !== myRole &&
    lastChoiceMade.strikerRole === sync.strikerRole
  );

  const myZone = selection.round === round ? selection.zone : null;
  const hasChosen = myZone !== null || syncSaysIChose;
  const rivalChosen = rivalChosenFromEvent || syncSaysRivalChose;

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

// Вся логика экрана матча в одном месте: роль, кто сейчас на позиции "у
// ворот"/"у мяча" (по strikerRole/keeperRole — НЕ по тому, кто локальный
// игрок, камера в сцене всегда одна и та же), персонажи обеих позиций,
// готовность выбора. Ничего не рендерит — см. ui/*.
export function useGameScreenModel() {
  const { sync, myRole, lastRoundResult } = useGameState();
  const { myZone, hasChosen, rivalChosen, selectZone } = useRoundSelectionLock();

  const currentRound = sync?.currentRound ?? 1;
  const totalRounds = sync?.totalRounds ?? 10;
  const scores = sync?.scores ?? { player_1: 0, player_2: 0 };
  const isStriker = sync?.strikerRole === myRole;

  const strikerCharacter = (sync ? sync.characters[sync.strikerRole] : null) ?? DEFAULT_CHARACTER;
  const keeperCharacter = (sync ? sync.characters[sync.keeperRole] : null) ?? DEFAULT_CHARACTER;

  const handleSelectZone = (zone: number) => {
    if (isZoneId(zone)) selectZone(zone);
  };

  return {
    currentRound,
    totalRounds,
    scores,
    isStriker,
    myRole,
    strikerCharacter,
    keeperCharacter,
    myZone,
    hasChosen,
    rivalChosen,
    selectZone: handleSelectZone,
    lastRoundResult,
    roundResultVisible: sync?.state === "ROUND_RESULT" && !!lastRoundResult,
  };
}
