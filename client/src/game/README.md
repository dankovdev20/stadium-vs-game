# `game/` — состояние матча и связь с сервером

Здесь живёт вся "правда" о текущем матче на клиенте: FSM-состояние, роль
игрока, последние события с сервера. Любой компонент, которому нужно знать
"что сейчас происходит в игре" или отправить действие на сервер, идёт сюда —
и никуда больше (не в `services/connection` напрямую).

## Файлы

- **`types.ts`** — все типы контракта: `GamePhase` (шесть состояний FSM),
  `StateSyncPayload` (форма периодической рассылки `state:sync`),
  `ServerAction` (объединение всех событий, которые понимает `gameReducer`),
  `GameState` (то, что хранится в React-контексте).
- **`gameReducer.ts`** — чистая функция `(state, action) => state`. Один
  `case` на каждое серверное событие. Никакой логики ветвления фаз здесь
  нет — редьюсер только запоминает последний пришедший payload.
- **`GameContext.tsx`** — React Context + провайдер. Поднимает соединение
  (`createConnection()` из `services/connection`), подписывается на все
  события из `EVENT_TYPES`, прокидывает их в `gameReducer`, и отдаёт наружу
  четыре хука.

## Реконнект и сбросы (живучесть стенда)

- **`session.ts`** — `sessionToken` из `role:assigned` лежит в
  `sessionStorage` (на вкладку). `GameContext` на КАЖДЫЙ `connect` шлёт
  `player:reconnect` с ним — F5 или обрыв сети не убивают матч.
  Пока ждём ответа, `useConnectionStatus().restoring === true`.
- `RECONNECT_FAILED` / `room:hard_reset` → сессия стирается, `myRole = null`.
- `resetEpoch` (растёт на каждый `room:hard_reset`) и `connectCount` —
  `key` для `LobbyScreen` в `App.tsx`: локальный стейт экрана не переживает
  сброс. Если заводите локальный `useState` в экране, который может остаться
  смонтированным через сброс, — вешайте тот же `key`.
- `components/status/` — оверлей «нет связи», баннер «соперник отвалился»
  с отсчётом и заглушка «Trwa mecz» для терминала без роли.

## Как читать состояние в компоненте

```tsx
import { useGameState, useGamePhase, useGameEmit } from "../../game/GameContext";

function MyScreen() {
  const phase = useGamePhase();           // "LOBBY" | "CUSTOMIZATION" | ... — что рендерить
  const { sync, myRole } = useGameState(); // sync — последний полный снэпшот с сервера
  const emit = useGameEmit();              // emit("player:select_role", "player_1")
  ...
}
```

Важно: `sync` может быть `null` до первого `state:sync` от сервера (доля
секунды на реальном сокете, чуть больше на первом коннекте). Компоненты,
которые рендерятся только при конкретной фазе (см. `App.tsx`), к этому
моменту `sync` уже получат — но если пишете что-то, что рендерится ДО
подключения, ставьте дефолты (`sync?.scores ?? { player_1: 0, player_2: 0 }`).

`GameContext` — единственный источник правды. Не создавайте второй
`useState` для того, что уже есть в `sync`: раньше модалка "Играть снова"
получала данные пропсами-снэпшотом и не обновлялась вживую; сейчас
`feature/play-again/ui/PlayAgainModal.tsx` сама читает `useGameState()` —
используйте её как образец для новых компонентов, зависящих от live-стейта.

## Как добавить новое серверное событие

На примере уже сделанного (`restart` внутри `state:sync`, блок C доработки):

1. **Сервер** эмитит новое поле/событие (см. `server/src/gameRoom.js`).
2. **`types.ts`** — расширить `StateSyncPayload` (или добавить новый тип
   payload + запись в `ServerAction`, если это отдельное событие, а не поле
   внутри `state:sync`).
3. Если это отдельное новое СОБЫТИЕ (а не поле внутри `state:sync`):
   - добавить имя в `EVENT_TYPES` в `GameContext.tsx`;
   - добавить `case` в `gameReducer.ts`, который кладёт payload в `GameState`;
   - добавить поле в `GameState`/`initialGameState` в `types.ts`.
4. Использовать в компоненте через `useGameState()`.

Если новое поле просто добавлено ВНУТРЬ `state:sync` (как `restart`),
отдельного `case`'а не нужно — `case "state:sync": return { ...state, sync: action.payload }`
уже кладёт весь объект целиком, поле подхватится само.

## Как отправить действие на сервер

```tsx
const emit = useGameEmit();
emit("game:choose_zone", 3); // событие + payload, как в реестре ниже
```

Полный реестр клиент→сервер и сервер→клиент событий — в
`shared/put_me_in_context.md` (раздел 3) + раздел 7 того же файла (живые
изменения поверх исходного контракта: голосование за рестарт, idle-автосброс).
