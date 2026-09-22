================================================================================
STADIUM VS (1 VS 1 PENALTY SHOOTOUT) — MASTER SKELETON KEY & FRONTEND BLUEPRINT
Автономный Мастер-Ключ Архитектуры, Контракты WebSockets и Спецификация UI
СТАТУС ДОКУМЕНТА: ВЕДУЩИЙ АРХИТЕКТУРНЫЙ КАРКАС И СПЕЦИФИКАЦИЯ ИНТЕГРАЦИИ
ВЕРСИЯ ДОКУМЕНТА: v1.2.0 (Synced with server/src/gameRoom.js @ main, 2026-09-22)
ЛОКАЛИЗАЦИЯ: Польский язык (Język polski — терминология, статусы, интерфейс)
================================================================================

РАЗДЕЛ 0: ДИРЕКТИВА ДЛЯ НЕЙРОСЕТИ (AI OPERATING DIRECTIVE)

Ты — Главный Frontend-Архитектор и Senior Game UI/UX Engineer проекта.
Пользователь передаёт тебе этот документ в качестве эталонного контракта
системы. В нём зафиксированы: 100% событий Socket.io, машина состояний (FSM),
математика шансов из PDF, контракты моделей сборки персонажа и аппаратные
ограничения интерактивных терминалов (тачскрины Full HD в Kiosk-режиме).

ПРАВИЛА И ПРОТОКОЛ РАБОТЫ:

1. СТРОГОЕ СОБЛЮДЕНИЕ ИМЁН И ТИПОВ СОБЫТИЙ: Никаких выдуманных эвентов.
   Использовать исключительно зарегистрированные события Socket.io из Раздела 3.
2. ПРИНЦИП ХИРУРГИЧЕСКОГО КОДА: Выдавать завершённые компоненты и скрипты
   без плейсхолдеров («// здесь добавьте логику...»). Код должен сразу
   монтироваться в приложение.
3. KIOSK & TOUCHSCREEN OPSEC: Код фронтенда обязан быть аппаратно защищен от
   случайных действий детей:
   - Полный запрет контекстного меню (oncontextmenu="return false;").
   - Запрет выделения текста (user-select: none; -webkit-user-select: none;).
   - Запрет зума жестами и скролл-баунса (touch-action: pan-x pan-y / manipulation).
   - Минимальный размер тач-таргетов: не менее 64x64px.
4. СЕРВЕРНАЯ ПРАВДА (SERVER-AUTHORITATIVE): Клиент не считает очки и не
   определяет попадание/сейв мяча самостоятельно. Клиент отправляет выбор зоны
   (1–5) и лишь воспроизводит анимацию на основе полученного от бэкенда исхода
   (GOL, OBRONA_PERFEKCYJNA, SLUPEK_POPRZECZKA и т.д.).
5. ДВУХСТОРОННИЙ ПОЛЬСКИЙ КОНТЕНТ: Все системные исходы, надписи интерфейса,
   баннеры ролей и сообщения статуса формируются строго на польском языке.

================================================================================
РАЗДЕЛ 1: АППАРАТНАЯ ПЛАТФОРМА И СРЕДА РАЗВЁРТЫВАНИЯ (KIOSK HARDWARE SPEC)

1. Физическая среда:
   - Два терминала с сенсорными экранами (Touchscreen 1080p, 1920x1080 Full HD).
   - ПК: Intel Core i5-8400, 16GB RAM, NVIDIA GeForce GTX 1050.
   - Сеть: Выделенный локальный роутер/свитч (LAN), фиксированные статические IP.
   - Бэкенд запущен на одном из терминалов (или сервере стойки) на порту 3000.
   - Фронтенд: Браузер Google Chrome в режиме постоянного киоска:
     chrome.exe --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 "http://192.168.X.X:3000"

2. CSS-стандарты терминалов:
   html, body {
     width: 100vw;
     height: 100vh;
     overflow: hidden;
     margin: 0;
     padding: 0;
     user-select: none;
     -webkit-user-select: none;
     -webkit-touch-callout: none;
     touch-action: manipulation;
     background: #000;
   }

================================================================================
РАЗДЕЛ 2: АРХИТЕКТУРА СОСТОЯНИЙ (FINITE STATE MACHINE — FSM)

Игра движется по жесткому конвейеру фаз (Server-Driven):

    [LOBBY] 
       │ (Оба терминала заняли слоты: Gracz 1 и Gracz 2)
       ▼
    [CUSTOMIZATION] 
       │ (Оба игрока собрали робота и нажали «Zatwierdź»)
       ▼
 ┌─ [PLAYING] (Скрытый одновременный выбор зон 1-5)
 │     │ (Оба игрока нажали на зону)
 │     ▼
 │  [ROUND_RESULT] (Показ анимации полета мяча/сейва, 4 секунды)
 │     │ 
 └─────┤ (Если раунд < 10: смена ролей Napastnik <-> Bramkarz, новый раунд)
       │ (Если раунд = 10: подсчет победителя)
       ▼
    [GAME_OVER] (Экран победы / счета)
       │ (Нажатие «Zagraj Ponownie»)
       ▼
    [CUSTOMIZATION] (Сброс счета в 0:0, роли сохраняются, новый матч)

Исключение:
- [PAUSED_DISCONNECT]: объявлен в GAME_STATES, но НЕ ИСПОЛЬЗУЕТСЯ как активная
  фаза. При обрыве связи сервер помечает игрока отключённым, эмитит
  room:player_disconnected и запускает таймер на 10 секунд.
  Если отключившийся игрок присылает player:reconnect с валидным sessionToken
  до истечения таймаута — таймер сброса отменяется, и матч продолжается
  с того же места (эмитится room:player_reconnected).
  Если за 10 секунд игрок не вернулся — вызывается handleForceReset() →
  room:hard_reset, и комната возвращается в [LOBBY] напрямую из любой фазы.

================================================================================
РАЗДЕЛ 3: РЕЕСТР WEBSOCKET-СОБЫТИЙ (SOCKET.IO CONTRACTS)

--------------------------------------------------------------------------------
A. КЛИЕНТ -> СЕРВЕР (EMIT)
--------------------------------------------------------------------------------

1. player:select_role
   - Фаза: LOBBY
   - Назначение: Выбор физического терминала (Gracz 1 или Gracz 2).
   - Payload:
     "player_1" | "player_2"

2. character:submit
   - Фаза: CUSTOMIZATION
   - Назначение: Отправка собранной конфигурации персонажа.
   - Payload:
     {
       headId: number, // ID выбранной головы
       bodyId: number, // ID туловища с руками
       legsId: number  // ID ног
     }

3. game:choose_zone
   - Фаза: PLAYING
   - Назначение: Скрытый выбор зоны удара (Нападающий) или защиты (Вратарь).
   - Payload:
     number // Число от 1 до 5

4. game:restart
   - Фаза: GAME_OVER
   - Назначение: Мягкий рестарт матча. Сохраняет привязку игроков к экранам,
     обнуляет счет до 0:0 и сразу переводит обоих в фазу CUSTOMIZATION.
   - Payload: отсутствует (null / undefined)

5. room:force_reset
   - Фаза: ЛЮБАЯ (Сервисная кнопка администратора / отладка)
   - Назначение: Полный сброс комнаты до LOBBY с освобождением ролей.
   - Payload: отсутствует

6. player:reconnect
   - Фаза: ЛЮБАЯ (при повторном подключении сокета после обрыва)
   - Назначение: Восстановление роли и текущей сессии без сброса матча.
   - Payload:
     {
       sessionToken: string, // UUID сессии, полученный при role:assigned
       role?: "player_1" | "player_2"
     }

--------------------------------------------------------------------------------
B. СЕРВЕР -> КЛИЕНТ (LISTEN)
--------------------------------------------------------------------------------

1. state:sync
   - Периодичность: Рассылается ВСЕМ клиентам при ЛЮБОМ изменении стейта.
   - Payload:
     {
       state: "LOBBY" | "CUSTOMIZATION" | "PLAYING" | "ROUND_RESULT" | "GAME_OVER" | "PAUSED_DISCONNECT",
       currentRound: number, // Текущий раунд (1 - 10)
       totalRounds: 10,      // Всего раундов в матче
       strikerRole: "player_1" | "player_2", // Кто сейчас бьет
       keeperRole: "player_1" | "player_2",  // Кто сейчас защищает
       slots: {
         player_1_taken: boolean, // Занят ли слот Gracz 1
         player_2_taken: boolean  // Занят ли слот Gracz 2
       },
       choicesStatus: {
         player_1_chosen: boolean, // Сделал ли выбор игрок 1 в текущем раунде
         player_2_chosen: boolean  // Сделал ли выбор игрок 2 в текущем раунде
       },
       scores: {
         player_1: number, // Текущие очки Gracz 1
         player_2: number  // Текущие очки Gracz 2
       },
       characters: {
         player_1: { headId, bodyId, legsId } | null, // Персонаж Gracz 1 (null до подтверждения)
         player_2: { headId, bodyId, legsId } | null  // Персонаж Gracz 2 (null до подтверждения)
       },
       restart: {
         player_1_ready: boolean, // Проголосовал ли Gracz 1 за рестарт
         player_2_ready: boolean, // Проголосовал ли Gracz 2 за рестарт
         deadline: number | null  // epoch ms дедлайна голосования; null вне GAME_OVER
       }
     }

2. role:assigned
   - Назначение: Подтверждение серверного назначения роли данному сокету (или восстановления).
   - Payload:
     {
       role: "player_1" | "player_2",
       sessionToken: string,  // Уникальный ключ сессии для реконнекта
       reconnected?: boolean  // true, если вызов произошёл по player:reconnect
     }

3. round:choice_made
   - Фаза: PLAYING
   - Назначение: Сигнал о том, что один из игроков сделал свой скрытый выбор.
   - Payload:
     {
       role: "player_1" | "player_2",
       strikerRole: "player_1" | "player_2",
       keeperRole: "player_1" | "player_2"
     }
   - UX-директива: Если role === myRole -> показать «Twój wybór zapisany! Oczekiwanie na rywala...».
                   Если role !== myRole -> показать «Rywal podjął decyzję! Twój ruch!».

4. round:resolved
   - Фаза: Переход в ROUND_RESULT
   - Назначение: Серверный расчет исхода удара. Ключевое событие для 3D/2D-сцены.
   - Payload:
     {
       round: number,
       strikerRole: "player_1" | "player_2",
       keeperRole: "player_1" | "player_2",
       strikerZone: number, // 1 - 5 (Куда бил нападающий)
       keeperZone: number,  // 1 - 5 (Куда прыгнул вратарь)
       result: {
         isGoal: boolean,
         pointsAwarded: number, // 0, 1 или 2
         outcome: "GOL" | "OBRONA_PERFEKCYJNA" | "OBRONA_NOGA" | "FUKS_BRAMKARZA" | "SLUPEK_POPRZECZKA" | "NAD_POPRZECZKA",
         details: string // Текстовое описание на польском языке
       },
       scores: {
         player_1: number,
         player_2: number
       }
     }

5. game:over
   - Фаза: GAME_OVER
   - Назначение: Окончание матча после 10 раундов.
   - Payload:
     {
       winner: "player_1" | "player_2" | "REMIS",
       scores: {
         player_1: number,
         player_2: number
       }
     }

6. room:player_disconnected
   - Назначение: Один из терминалов потерял соединение.
   - Payload:
     {
       role: "player_1" | "player_2",
       timeoutSec: number // Например, 10
     }

7. room:player_reconnected
   - Назначение: Игрок успешно вернулся в матч по sessionToken до истечения таймаута.
   - Payload:
     {
       role: "player_1" | "player_2"
     }

8. room:hard_reset
   - Назначение: Комната сброшена до начального состояния. Клиент обязан
     очистить локальную роль (myRole = null) и показать экран LOBBY.

9. room:error
   - Назначение: Системная ошибка (например, попытка занять занятый слот или неверный токен).
   - Payload:
     {
       code: "ROLE_TAKEN" | "RECONNECT_FAILED",
       message: string
     }

================================================================================
РАЗДЕЛ 4: МЕХАНИКА СТРЕФ, ШАНСОВ И АНИМАЦИЙ (PDF GAME RULES)

1. Таблица целей и очков (5 Stref):
   ┌──────┬─────────────────┬──────────┬──────────┬──────────────────────┐
   │ Зона │ Название        │ Позиция  │ Очки     │ Риск / Механика      │
   ├──────┼─────────────────┼──────────┼──────────┼──────────────────────┤
   │ 1    │ Góra-Lewo       │ Верх-Лев │ 2 pkt    │ 20% Pudło, 10% Fuks  │
   │ 2    │ Góra-Środek     │ Верх-Цен │ 2 pkt    │ 20% Nad poprzeczką   │
   │ 3    │ Góra-Prawo      │ Верх-Прав│ 2 pkt    │ 20% Pudło, 10% Fuks  │
   │ 4    │ Dół-Lewo        │ Низ-Лев  │ 1 pkt    │ 0% Pudła, 30% Noga   │
   │ 5    │ Dół-Prawo       │ Низ-Прав │ 1 pkt    │ 0% Pudła, 30% Noga   │
   └──────┴─────────────────┴──────────┴──────────┴──────────────────────┘

2. Матрица исходов (Что воспроизводить фронтенду по result.outcome):
   
   - OBRONA_PERFEKCYJNA (Зоны совпали: strikerZone === keeperZone):
     Вратарь прыгает прямо в угол мяча и намертво берет/отбивает его руками.
     Гол = 0%, Очки = 0.
   
   - GOL (Зоны не совпали, выпали 70% успеха):
     Мяч влетает в выбранную зону сетки ворот. Вратарь либо не дотягивается,
     либо прыгнул в противоположный угол.
     Очки: +2 (для зон 1, 2, 3) или +1 (для зон 4, 5).

   - SLUPEK_POPRZECZKA (Зоны 1 или 3, выпали 20% промаха):
     Мяч со звоном ударяется в штангу или крестовину и отлетает в поле.

   - NAD_POPRZECZKA (Зона 2, выпали 20% промаха):
     Мяч летит выше перекладины на трибуны.

   - FUKS_BRAMKARZA (Зоны 1, 2, 3, выпали 10% случайной защиты):
     Вратарь прыгнул не туда, но в акробатическом падении цепляет мяч кончиками
     пальцев / рикошет от пятки.

   - OBRONA_NOGA (Зоны 4 или 5, выпали 30% защиты ногой):
     Мяч идет в нижний угол, вратарь выбрасывает ногу в шпагате и парирует удар.

================================================================================
РАЗДЕЛ 5: СПЕЦИФИКАЦИЯ ЭКРАНОВ ДЛЯ ФРОНТЕНДА (SCREENS SPEC)

1. Экран 0: LOBBY (Выбор терминала / Stanowiska)
   - Активен при: state === 'LOBBY' && myRole === null.
   - Элементы:
     - Две огромные сенсорные кнопки: [ GRACZ 1 ] и [ GRACZ 2 ].
     - Если state.slots.player_1_taken === true -> кнопка [ GRACZ 1 ]
       мгновенно исчезает или становится disabled: true с бейджем «Zajęty».
     - При клике: отправка player:select_role.

2. Экран 1: CUSTOMIZATION (Kreator Robota)
   - Активен при: state === 'CUSTOMIZATION'.
   - Синхронизация: Заголовок «KROK 1: ZBUDUJ SWOJEGO ZAWODNIKA».
   - Модули конструктора: Карусели/сетки выбора (Głowa, Korpus/Ręce, Nogi).
   - Кнопка: [ ZATWIERDŹ POSTAĆ ].
   - После нажатия: блокировка кнопки, статус «Oczekiwanie na rywala...».
   - Переход в игру произойдет автоматически, когда оба нажмут утверждение.

3. Экран 2: PLAYING & ROUND_RESULT (Rzuty Karne 1v1)
   - Активен при: state === 'PLAYING' || state === 'ROUND_RESULT'.
   - HUD вверху экрана:
     - Текущий раунд: «RUNDA X / 10».
     - Счет: «GRACZ 1: [X] — [Y] : GRACZ 2».
     - Баннер роли (динамический по state.strikerRole === myRole):
       * Если ты бьешь: «TWOJA TURA: NAPASTNIK (STRZELAJ!)» (Зеленый цвет).
       * Если ты защищаешь: «TWOJA TURA: BRAMKARZ (BROŃ!)» (Синий цвет).
   - Интерактивное поле:
     - Перспектива Нападающего: вид сзади/сверху на ворота.
     - Перспектива Вратаря: вид от первого лица (перчатки) или из ворот.
     - 5 сенсорных мишеней на воротах (Зоны 1–5).
   - Поведение кнопок:
     - При клике на зону: кнопки ЗОН МГНОВЕННО БЛОКИРУЮТСЯ для исключения дабл-тапов.
     - Статус игрока: «Twój wybór zapisany. Czekaj na strzał!».
     - Статус соперника: «Rywal zajął pozycję!».
   - Фаза ROUND_RESULT (4 секунды):
     - Получение события round:resolved.
     - Запуск соответствующей 3D/2D анимации удара и реакции вратаря.
     - Оверлей с крупной надписью результата (GOL! / OBRONA!).

4. Экран 3: GAME_OVER (Podsumowanie Meczu)
   - Активен при: state === 'GAME_OVER'.
   - Элементы:
     - Крупный победный баннер: «WYGRAŁ GRACZ 1!», «WYGRAŁ GRACZ 2!» или «REMIS!».
     - Финальный счет матча.
     - Большая сенсорная кнопка: [ ZAGRAJ PONOWNIE ].
     - При нажатии: отправка game:restart. Оба экрана синхронно прыгают
       в CUSTOMIZATION, сохраняя выбранные терминалы.

================================================================================
РАЗДЕЛ 6: ИНСТРУКЦИЯ ПО ТЕСТИРОВАНИЮ БЭКЕНДА (SMOKE & STRESS)

Для проверки соответствия контракта на машине бэкенда запустить:
1. Юнит-тесты и валидация Монте-Карло (10 000 симуляций шансов):
   npm test
   Ожидаемый результат: Все тесты пройдены (зеленый статус), шанс гола = ~70%.

2. Запуск сервера:
   npm start
   Сервер слушает на 0.0.0.0:3000 (доступен по локальной сети LAN).

================================================================================
РАЗДЕЛ 7: ЖИВЫЕ ИЗМЕНЕНИЯ ОТ v1.0.0 (ДОПОЛНЕНО 2026-09-18)

Документ выше — исходный эталон. Ниже зафиксированы осознанные отступления
от него, принятые по ходу разработки (выставочный/киоск-формат, а не
единичная домашняя партия). Разделы 1–6 НЕ переписаны и остаются верными
там, где не противоречат этому разделу.

1. game:restart — ТЕПЕРЬ ГОЛОСОВАНИЕ, А НЕ МГНОВЕННЫЙ РЕСТАРТ.

   Было (раздел 3.A.4): один клик → сразу CUSTOMIZATION для обоих.
   Стало: на GAME_OVER открывается окно 10 секунд. Каждый игрок жмёт
   «Zagraj Ponownie» отдельно — сервер копит голоса в state:sync.restart
   ({ player_1_ready, player_2_ready, deadline }). Если проголосовали ОБА —
   рестарт мгновенный (ждать остаток 10 сек не нужно). Если к дедлайну
   подтвердил только один или никто — комната полностью сбрасывается в
   LOBBY (room:hard_reset), как по кнопке room:force_reset.

   Причина: на стенде нельзя, чтобы один ребёнок в одиночку перезапускал
   матч за партнёра, который уже отошёл — тайм-аут освобождает стенд для
   следующей пары игроков вместо зависания в ожидании.

   Реализация: server/src/gameRoom.js (finishGame/handleRestartGame/_doRestart),
   тесты — server/tests/gameRoom.test.js, раздел 3. Подробности контракта —
   server/README.md.

2. НОВОЕ: АВТОСБРОС ПРИ ПРОСТОЕ (IDLE_TIMEOUT_MS, 90 сек).

   Если комната застряла в LOBBY (кто-то занял слот, второй не пришёл) или
   в CUSTOMIZATION (кто-то не подтверждает персонажа) дольше 90 секунд без
   каких-либо действий — автоматический room:force_reset. Во время самого
   матча (PLAYING/ROUND_RESULT/GAME_OVER) этот таймер осознанно не
   действует — нельзя обрывать игру из-за паузы на подумать.

   Реализация: GameRoom.armIdleTimer(), вызывается из handleSelectRole и
   handleCharacterReady.

3. character:submit — РЕАЛЬНЫЙ PAYLOAD, А НЕ ЗАГЛУШКА.

   Раздел 3.A.2 контракта не менялся — { headId, bodyId, legsId } как и
   было. Уточнение: на клиенте это теперь настоящий выбор игрока в
   конструкторе (client/src/feature/character-builder/), а не фиктивные
   значения {1,1,1}, как было на раннем этапе разработки фронтенда.
   Сами head/body/legs ID пока указывают на плейсхолдер-варианты (цветные
   плашки с иконками) — реального 3D/2D-арта персонажей ещё нет, сервер
   payload не глядя пропускает как opaque-объект, так что подключение
   настоящего арта не потребует изменений контракта.

4. НОВОЕ ПОЛЕ: state:sync.characters — ВЫБОР ОБОИХ ИГРОКОВ ТЕПЕРЬ ДОЛЕТАЕТ ДО КЛИЕНТА.

   До этого пункта payload character:submit сохранялся на сервере
   (this.players[role].character), но НИКОГДА не рассылался обратно —
   клиент не мог знать даже собственный выбор после реконнекта, не говоря
   уже о выборе соперника. state:sync теперь всегда содержит:

     characters: {
       player_1: { headId, bodyId, legsId } | null,
       player_2: { headId, bodyId, legsId } | null
     }

   null — пока игрок ещё не подтвердил персонажа в CUSTOMIZATION, либо
   после game:restart/room:hard_reset (оба сбрасываются в null вместе со
   счётом). Используется на экране PLAYING/ROUND_RESULT, чтобы каждый
   клиент рисовал и свою модель, и модель соперника (см. РАЗДЕЛ 5, п.3 —
   актуальная реализация сцены "оба персонажа видны на поле" описана в
   client/src/screens/GameScreen/, README не дублируем здесь).

5. state:sync РАССЫЛАЕТСЯ ПРИ ПОДКЛЮЧЕНИИ НОВОГО СОКЕТА.

   server.js: io.on('connection', (socket) => { room.broadcastState(); ... }).
   Любой новый клиент мгновенно получает полный снэпшот текущего состояния
   комнаты без необходимости явно запрашивать его. В исходном контракте
   (Раздел 3.B.1) это подразумевалось, но не было прописано эксплицитно.

6. broadcastState() ПОСЛЕ КАЖДОГО ИНДИВИДУАЛЬНОГО ВЫБОРА ЗОНЫ.

   Было (неявно): state:sync рассылался только при resolveRound(), т.е. когда
   выбрали ОБА игрока. Стало: handleMakeChoice() вызывает broadcastState()
   сразу после записи зоны одного игрока — choicesStatus.player_X_chosen
   обновляется в реальном времени, клиент может заблокировать кнопки и
   показать «Twój wybór zapisany» по state:sync, а не только по
   round:choice_made.

   Реализация: server/src/gameRoom.js, handleMakeChoice(), строка после
   io.emit('round:choice_made', ...). Если планируется троттлинг рассылок —
   этот вызов можно убрать без последствий для текущего фронтенда (клиент
   дублирует замок выбора локально).

7. PAUSED_DISCONNECT — ДЕКЛАРАТИВНОЕ СОСТОЯНИЕ, НЕ ИСПОЛЬЗУЕТСЯ КАК ФАЗА.

   В GAME_STATES объявлено значение 'PAUSED_DISCONNECT', но ни один
   обработчик никогда не устанавливает this.state = PAUSED_DISCONNECT.
   Фактический флоу дисконнекта: handleDisconnect() → пометка
   isConnected=false → emit room:player_disconnected → setTimeout(10s) →
   handleForceReset() → hardResetRoom() → LOBBY. Комната остаётся в
   текущей фазе (PLAYING, CUSTOMIZATION, ...) весь период ожидания
   реконнекта.

   FSM-диаграмма Раздела 2 обновлена соответственно.

8. room:error — КОД "ROOM_FULL" НЕ ЭМИТИТСЯ.

   Раздел 3.B.8 описывал коды ROLE_TAKEN | ROOM_FULL. В реализации
   handleSelectRole() эмитит только ROLE_TAKEN (если конкретный слот занят).
   Ситуация «комната полна» не генерирует ошибку: когда оба слота заняты,
   state уже !== LOBBY, и handleSelectRole() выходит молча (return).
   Код ROOM_FULL убран из канонического payload в Разделе 3.

9. ВОССТАНОВЛЕНИЕ СЕССИИ (RECONNECT) БЕЗ СБРОСА КОМНАТЫ.

   В handleSelectRole() сервер генерирует криптографический sessionToken
   (crypto.randomUUID()) и возвращает его клиенту в событии role:assigned:
   { role, sessionToken }.
   При кратковременном обрыве соединения (Wi-Fi на стенде, смена сокета)
   клиент отправляет socket.emit('player:reconnect', { sessionToken, role? }).
   Сервер верифицирует токен, восстанавливает socket.role, привязывает
   новый socketId, отменяет 10-секундный disconnectTimer и возвращает
   игрока в активный матч без сброса раунда и счёта.
   Если токен неверен или комната уже была сброшена по таймауту — сервер
   эмитит room:error с кодом RECONNECT_FAILED.
   Клиентская тестовая панель (server/public/index.html) автоматически сохраняет
   sessionToken в localStorage и производит прозрачный реконнект при
   восстановлении связи.

================================================================================
10. ZAŚWIADCZENIE / OCHRONA PRZED PRZEJĘCIEM OBU RÓL PRZEZ JEDEN SOCKET (2026-09-22).

    Było: handleSelectRole() w gameRoom.js sprawdzał jedynie czy dany slot
    (this.players[requestedRole]) jest wolny, ignorując to, czy socket ma już
    przypisaną inną rolę. Umożliwiało to jednemu klientowi wysłanie
    player:select_role('player_1'), a następnie player:select_role('player_2'),
    co natychmiast przerzucało pokój do CUSTOMIZATION bez udziału drugiego gracza.

    Stało się:
    - Serwer weryfikuje socket.role. Jeśli socket ma już przypisaną inną rolę
      niż requestedRole, odrzuca żądanie z kodem błędu ROLE_TAKEN
      ('Masz już przypisaną rolę!').
    - Ponowne kliknięcie w swoją własną rolę przez ten sam socket jest
      bezpiecznie ignorowane (wczesny return), bez zmiany tokenu sesji.
    - Wszystkie zdarzenia meczu (character:submit, game:choose_zone,
      game:restart) są autoryzowane po stronie serwera wyłącznie w oparciu
      o powiązany socket.role, uniemożliwiając podszywanie się pod drugiego gracza.

================================================================================
--- END OF FILE PROJECT_SKELETON_KEY.txt ---

