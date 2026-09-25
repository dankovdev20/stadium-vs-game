# Stadium VS — Penalty Showdown

1v1-пенальти для двух сенсорных терминалов в одной локальной сети. Сервер —
единственный источник правды (клиент не считает голы/сейвы сам, только
выбирает зону и воспроизводит присланный исход).

## Быстрый старт (сервер + клиент вместе)

```bash
# терминал 1 — бэкенд
cd server
npm install
npm start        # http://localhost:3000 (или по IP в локальной сети), под супервизором

# терминал 2 — фронтенд
cd client
npm install
npm run dev       # http://localhost:5173
```

Клиент подключается к реальному серверу, если в `client/.env.local` задан
`VITE_WS_URL` — иначе автоматически работает на локальной заглушке
(`services/connection/mockConnection.ts`), которая сама эмулирует второго
игрока, что удобно для разработки в одиночку. Индикатор в верхнем левом
углу (`DevPanel`, только в dev-сборке) показывает, какой режим активен —
`SERWER` или `MOCK`.

### Режим стенда (выставка)

```bash
npm run setup   # один раз
npm run stand   # собрать клиент и запустить сервер: игра на http://IP:3000
```

Подробно — сеть, киоски, порядок запуска, что делать при сбоях: [STAND.md](STAND.md).

## Карта проекта

```
client/src/
  App.tsx              — маршрутизация экранов по фазе матча (FSM)
  game/                — состояние матча, контракт с сервером → см. game/README.md
  services/connection/ — абстракция транспорта (сокет/заглушка) → см. README.md
  screens/             — один компонент на фазу FSM (Lobby/Customization/Game/...)
  feature/             — самостоятельные модули логика+UI → см. feature/README.md
  components/ui/       — дизайн-система (Button/Panel/Badge)
  components/layout/   — ScreenShell — общий фон-каркас экранов
  styles/tokens.css     — все именованные цвета/размеры проекта в одном месте
  dev/devPanel.tsx      — служебная панель (только import.meta.env.DEV)

server/
  server.js            — точка входа, регистрация socket.io-обработчиков
  src/gameRoom.js       — FSM-машина комнаты → см. server/README.md
  src/gameRules.js       — таблица зон и вероятностей исхода удара
  tests/                 — node --test (юнит + Монте-Карло на вероятности)

shared/put_me_in_context.md — полный контракт: события WebSocket, FSM,
  спецификация экранов (раздел 5), живые отличия от исходной версии (раздел 7)
```

## Где что искать

| Вопрос | Куда смотреть |
|---|---|
| Какие события шлёт/слушает сокет | `shared/put_me_in_context.md`, раздел 3 |
| Как прочитать состояние матча в компоненте | `client/src/game/README.md` |
| Как добавить новое серверное событие | `client/src/game/README.md` |
| Как работает голосование "Играть снова" и авто-сброс при простое | `server/README.md` + `put_me_in_context.md`, раздел 7 |
| Конвенция `model/`+`ui/` для новых фич | `client/src/feature/README.md` |
| Цвета, тап-таргеты, тема оформления | `client/src/styles/tokens.css` |

## Тесты

```bash
cd server && npm test   # gameRules.js + gameRoom.js, мгновенно (t.mock.timers)
cd client && npx tsc -b --noEmit && npx eslint .
```
